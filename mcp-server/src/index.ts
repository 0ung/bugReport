#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const API_BASE_URL = (process.env.OPSPILOT_API_BASE ?? 'http://localhost:8080/api').replace(/\/$/, '')

const severitySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
const incidentStatusSchema = z.enum(['OPEN', 'ANALYZING', 'MITIGATED', 'RESOLVED', 'CLOSED'])
const incidentSourceSchema = z.enum(['ALERT', 'CUSTOMER', 'DEPLOYMENT', 'MANUAL'])
const logLevelSchema = z.enum(['INFO', 'WARN', 'ERROR'])
const feedbackRatingSchema = z.enum(['HELPFUL', 'PARTIAL', 'MISLEADING'])

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
  timestamp: string
}

type ToolResult = {
  isError?: boolean
  content: Array<{
    type: 'text'
    text: string
  }>
}

async function opspilot<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })
  const body = (await response.json()) as ApiResponse<T>

  if (!response.ok || !body.success) {
    throw new Error(body.message || `OpsPilot API request failed: ${response.status}`)
  }

  return body.data
}

function result(data: unknown): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  }
}

function failure(error: unknown): ToolResult {
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: error instanceof Error ? error.message : String(error),
      },
    ],
  }
}

function query(params: Record<string, string | undefined>) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value)
    }
  }

  const value = search.toString()
  return value ? `?${value}` : ''
}

const server = new McpServer({
  name: 'opspilot-mcp',
  version: '0.1.0',
})

server.registerTool(
  'list_incidents',
  {
    title: 'List incidents',
    description: 'List OpsPilot incidents, optionally filtered by keyword, status, or severity.',
    inputSchema: {
      keyword: z.string().optional(),
      status: incidentStatusSchema.optional(),
      severity: severitySchema.optional(),
    },
  },
  async ({ keyword, status, severity }) => {
    try {
      const incidents = keyword
        ? await opspilot<unknown[]>(`/search/incidents${query({ keyword })}`)
        : await opspilot<unknown[]>('/incidents')
      const filtered = incidents.filter((incident) => {
        const item = incident as { status?: string; severity?: string }
        return (!status || item.status === status) && (!severity || item.severity === severity)
      })

      return result(filtered)
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'get_incident_detail',
  {
    title: 'Get incident detail',
    description: 'Get one incident with logs, related runbooks, similar incidents, AI analysis, resolution, and feedback.',
    inputSchema: {
      incidentId: z.number().int().positive(),
    },
  },
  async ({ incidentId }) => {
    try {
      return result(await opspilot<unknown>(`/incidents/${incidentId}`))
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'search_incidents',
  {
    title: 'Search incidents',
    description: 'Search OpsPilot incidents by title, description, service name, or extracted keyword.',
    inputSchema: {
      keyword: z.string().min(1),
    },
  },
  async ({ keyword }) => {
    try {
      return result(await opspilot<unknown[]>(`/search/incidents${query({ keyword })}`))
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'list_runbooks',
  {
    title: 'List runbooks',
    description: 'List runbooks, optionally filtered by keyword or service name.',
    inputSchema: {
      keyword: z.string().optional(),
    },
  },
  async ({ keyword }) => {
    try {
      return result(
        keyword
          ? await opspilot<unknown[]>(`/search/runbooks${query({ keyword })}`)
          : await opspilot<unknown[]>('/runbooks'),
      )
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'get_dashboard_summary',
  {
    title: 'Get dashboard summary',
    description: 'Get OpsPilot dashboard summary, severity stats, top keywords, and recent incidents.',
    inputSchema: {},
  },
  async () => {
    try {
      return result(await opspilot<unknown>('/dashboard'))
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'list_analysis_results',
  {
    title: 'List AI analysis results',
    description: 'List stored AI analysis results for incident response review.',
    inputSchema: {},
  },
  async () => {
    try {
      return result(await opspilot<unknown[]>('/analysis'))
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'create_incident',
  {
    title: 'Create incident',
    description: 'Create an incident from a user report and initial raw log.',
    inputSchema: {
      title: z.string().min(1),
      serviceName: z.string().min(1),
      severity: severitySchema,
      source: incidentSourceSchema,
      owner: z.string().min(1),
      affectedUsers: z.number().int().nonnegative(),
      description: z.string().min(1),
      rawLog: z.string().min(1),
    },
  },
  async (input) => {
    try {
      return result(
        await opspilot<unknown>('/incidents', {
          method: 'POST',
          body: JSON.stringify(input),
        }),
      )
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'add_incident_log',
  {
    title: 'Add incident log',
    description: 'Attach a new operational log line or alert payload to an existing incident.',
    inputSchema: {
      incidentId: z.number().int().positive(),
      level: logLevelSchema,
      source: z.string().min(1),
      message: z.string().min(1),
    },
  },
  async ({ incidentId, level, source, message }) => {
    try {
      return result(
        await opspilot<unknown>(`/incidents/${incidentId}/logs`, {
          method: 'POST',
          body: JSON.stringify({ level, source, message }),
        }),
      )
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'request_ai_analysis',
  {
    title: 'Request AI analysis',
    description: 'Ask OpsPilot to run grounded incident analysis using metadata, logs, similar incidents, and runbooks.',
    inputSchema: {
      incidentId: z.number().int().positive(),
    },
  },
  async ({ incidentId }) => {
    try {
      return result(
        await opspilot<unknown>(`/incidents/${incidentId}/analysis`, {
          method: 'POST',
        }),
      )
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'change_incident_status',
  {
    title: 'Change incident status',
    description: 'Change the workflow status of an incident after triage or mitigation.',
    inputSchema: {
      incidentId: z.number().int().positive(),
      status: incidentStatusSchema,
    },
  },
  async ({ incidentId, status }) => {
    try {
      return result(
        await opspilot<unknown>(`/incidents/${incidentId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),
      )
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'create_resolution',
  {
    title: 'Create resolution',
    description: 'Record the real mitigation, root cause, owner, and prevention notes for an incident.',
    inputSchema: {
      incidentId: z.number().int().positive(),
      actionSummary: z.string().min(1),
      rootCause: z.string().min(1),
      resolvedBy: z.string().min(1),
      preventionNotes: z.string().optional(),
    },
  },
  async ({ incidentId, actionSummary, rootCause, resolvedBy, preventionNotes }) => {
    try {
      return result(
        await opspilot<unknown>(`/incidents/${incidentId}/resolution`, {
          method: 'POST',
          body: JSON.stringify({
            actionSummary,
            rootCause,
            resolvedBy,
            preventionNotes: preventionNotes ?? '',
          }),
        }),
      )
    } catch (error) {
      return failure(error)
    }
  },
)

server.registerTool(
  'save_ai_feedback',
  {
    title: 'Save AI feedback',
    description: 'Save human feedback about whether the AI analysis helped the incident response.',
    inputSchema: {
      incidentId: z.number().int().positive(),
      rating: feedbackRatingSchema,
      note: z.string().min(1),
    },
  },
  async ({ incidentId, rating, note }) => {
    try {
      return result(
        await opspilot<unknown>(`/incidents/${incidentId}/feedback`, {
          method: 'POST',
          body: JSON.stringify({ rating, note }),
        }),
      )
    } catch (error) {
      return failure(error)
    }
  },
)

await server.connect(new StdioServerTransport())
