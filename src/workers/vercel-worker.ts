/**
 * Vercel Worker Process
 *
 * This runs as a separate Node.js process on Replit/Railway/etc.
 * Pulls jobs from Redis and executes them asynchronously
 *
 * Run with: node --require ts-node/register src/workers/vercel-worker.ts
 * Or deploy as separate worker service
 */

import { Redis } from '@upstash/redis'
import { generateWODs } from '@/src/engines/wodGenerator'
import { generateCoachIntelligence } from '@/src/engines/coachIntelligence'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

interface QueuedJob {
  job_id: string
  coach_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  created_at: string
  request_body?: Record<string, unknown>
}

const POLL_INTERVAL = 5000 // 5 seconds
const PROCESS_TIMEOUT = 180000 // 3 minutes per job

/**
 * Main worker loop
 */
async function startWorker(): Promise<void> {
  console.log('[Worker] Starting Vercel background job processor...')

  // Poll for jobs
  setInterval(async () => {
    try {
      // Get all queued jobs
      const keys = await redis.keys('job:*')
      if (!keys || keys.length === 0) return

      for (const key of keys) {
        const jobData = await redis.get(key)
        if (!jobData) continue

        const job = typeof jobData === 'string' ? JSON.parse(jobData) : jobData

        if (job.status === 'queued') {
          await processJob(job)
        }
      }
    } catch (error) {
      console.error('[Worker] Poll error:', error)
    }
  }, POLL_INTERVAL)

  console.log('[Worker] Ready to process jobs')
}

/**
 * Process a single job
 */
async function processJob(job: QueuedJob): Promise<void> {
  const startTime = Date.now()

  try {
    console.log(`[Worker] Processing job: ${job.job_id}`)

    // Update status
    const jobKey = `job:${job.job_id}`
    await redis.setex(
      jobKey,
      24 * 3600,
      JSON.stringify({ ...job, status: 'processing' })
    )

    // Execute job based on type
    const { type } = (job.request_body || {}) as { type?: string }

    let result: unknown

    switch (type) {
      case 'generate_wod_weekly': {
        console.log(`[Worker] Generating weekly WOD for coach: ${job.coach_id}`)
        result = await generateWODs({
          coach_id: job.coach_id,
          num_workouts: 5,
          focus: 'mixed',
        })
        break
      }

      case 'coach_intelligence': {
        console.log(`[Worker] Generating coach intelligence for: ${job.coach_id}`)
        result = await generateCoachIntelligence({
          coach_id: job.coach_id,
          date: new Date().toISOString().split('T')[0],
        })
        break
      }

      default:
        throw new Error(`Unknown job type: ${type}`)
    }

    // Mark complete
    const runtime = Date.now() - startTime
    await redis.setex(
      jobKey,
      24 * 3600,
      JSON.stringify({
        ...job,
        status: 'completed',
        result,
        runtime_ms: runtime,
        completed_at: new Date().toISOString(),
      })
    )

    console.log(`[Worker] Completed job ${job.job_id} in ${runtime}ms`)
  } catch (error) {
    const runtime = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : String(error)

    console.error(`[Worker] Failed job ${job.job_id}:`, errorMsg)

    // Mark failed
    const jobKey = `job:${job.job_id}`
    await redis.setex(
      jobKey,
      24 * 3600,
      JSON.stringify({
        ...job,
        status: 'failed',
        error: errorMsg,
        runtime_ms: runtime,
        failed_at: new Date().toISOString(),
      })
    )
  }
}

// Timeout protection
setTimeout(
  () => {
    console.error('[Worker] Process timeout - exiting')
    process.exit(1)
  },
  PROCESS_TIMEOUT
)

// Start worker
startWorker().catch((error) => {
  console.error('[Worker] Fatal error:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Worker] Received SIGTERM - shutting down gracefully')
  process.exit(0)
})
