import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

let queue: Queue | null = null
let connection: Redis | null = null

export function getQueue(): Queue {
  if (queue) return queue

  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not configured')
  }

  connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })

  queue = new Queue('volta-jobs', { connection })
  return queue
}

export type VoltaJobName =
  | 'calculate-acwr'
  | 'calculate-readiness'
  | 'analyze-programming'
  | 'update-cardio-phase'
  | 'check-inactivity'
  | 'send-push-notification'
