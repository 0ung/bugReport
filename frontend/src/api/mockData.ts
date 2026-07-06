import type { Incident } from '../types/incident'

export const incidents: Incident[] = [
  {
    id: 101,
    title: 'Payment API 502 Bad Gateway',
    serviceName: 'payment-api',
    severity: 'HIGH',
    status: 'ANALYZING',
    occurredAt: '2026-07-07T14:20:00',
    updatedAt: '2026-07-07T14:36:00',
    keywords: ['502', 'upstream timeout', 'SocketTimeoutException'],
  },
  {
    id: 98,
    title: 'External SaaS connection reset',
    serviceName: 'sync-worker',
    severity: 'MEDIUM',
    status: 'MITIGATED',
    occurredAt: '2026-07-05T09:12:00',
    updatedAt: '2026-07-05T10:02:00',
    keywords: ['Connection reset by peer', 'retry'],
  },
  {
    id: 94,
    title: 'Batch job delayed by API latency',
    serviceName: 'batch-worker',
    severity: 'LOW',
    status: 'RESOLVED',
    occurredAt: '2026-07-02T22:00:00',
    updatedAt: '2026-07-03T00:15:00',
    keywords: ['batch delayed', 'external api latency'],
  },
  {
    id: 87,
    title: 'DB connection pool exhausted',
    serviceName: 'order-api',
    severity: 'CRITICAL',
    status: 'OPEN',
    occurredAt: '2026-06-28T16:45:00',
    updatedAt: '2026-06-28T16:51:00',
    keywords: ['HikariPool', 'connection timeout'],
  },
]
