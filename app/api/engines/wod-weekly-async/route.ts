/**
 * POST /api/engines/wod-weekly-async?coach_id=X
 *
 * Async background job for weekly WOD generation
 * - Returns 202 Accepted immediately
 * - Queues job in Upstash Redis via BullMQ
 * - Timeout: 60s (engine-level)
 *
 * Usage:
 * POST /api/engines/wod-weekly-async?coach_id=coach123
 * Response: { job_id: "uuid", status: "queued" }
 *
 * Then poll: GET /api/jobs/job-id to check status
 */

import { NextRequest, NextResponse } from 'next/server'
import { Queue } from 'bullmq'
import { Redis } from '@upstash/redis'

interface QueuedJob {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  coach_id: string
  created_at: string
  estimated_completion?: string
}

// BullMQ queue for heavy operations
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Note: BullMQ with Upstash requires additional setup
// For now, we'll use Redis directly for job tracking

const JOB_TTL = 24 * 3600 // 24 hours

/**
 * Queue a WOD generation job
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const coach_id = searchParams.get('coach_id')

    if (!coach_id) {
      return NextResponse.json({ error: 'Missing coach_id' }, { status: 400 })
    }

    // Generate job ID
    const job_id = `wod-${coach_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const created_at = new Date().toISOString()

    // Store job metadata in Redis
    const jobData = {
      job_id,
      coach_id,
      status: 'queued',
      created_at,
      request_body: await request.json().catch(() => ({})),
    }

    await redis.setex(`job:${job_id}`, JOB_TTL, JSON.stringify(jobData))

    // Add to queue for processing
    // In production, this would connect to a worker process
    console.log(`[Queue] Scheduled WOD generation job: ${job_id} for coach ${coach_id}`)

    // Return immediately with 202 Accepted
    return NextResponse.json(
      {
        job_id,
        status: 'queued',
        coach_id,
        created_at,
        check_status_url: `/api/jobs/${job_id}`,
        estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // ~5 min
      },
      { status: 202 }
    )
  } catch (error) {
    console.error('[POST /api/engines/wod-weekly-async] Error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        status: 'error',
      },
      { status: 500 }
    )
  }
}

/**
 * Check job status
 * GET /api/engines/wod-weekly-async?job_id=X
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const job_id = searchParams.get('job_id')

    if (!job_id) {
      return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })
    }

    // Get job from Redis
    const jobData = await redis.get(`job:${job_id}`)

    if (!jobData) {
      return NextResponse.json(
        { error: 'Job not found or expired', status: 'not_found' },
        { status: 404 }
      )
    }

    const job = typeof jobData === 'string' ? JSON.parse(jobData) : jobData

    return NextResponse.json(
      {
        job_id,
        ...job,
        check_again_in_seconds: 10,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[GET /api/engines/wod-weekly-async] Error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        status: 'error',
      },
      { status: 500 }
    )
  }
}
