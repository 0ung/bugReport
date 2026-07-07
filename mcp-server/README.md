# OpsPilot MCP Server

OpsPilot MCP Server exposes the installed OpsPilot service to LLM clients over stdio.

The MCP server does not connect to PostgreSQL directly. It calls the local OpsPilot backend API, so the normal backend validation, search, AI analysis, and persistence flow remains the single source of truth.

```text
LLM Client
  -> stdio
OpsPilot MCP Server
  -> REST API
OpsPilot Backend
  -> PostgreSQL
```

## Run

Start OpsPilot first:

```powershell
docker compose up -d
```

Build the MCP server:

```powershell
cd mcp-server
npm install
npm run build
```

Run it directly:

```powershell
$env:OPSPILOT_API_BASE = "http://localhost:8080/api"
node dist/index.js
```

In normal use, an LLM client starts this process itself through stdio.

## LLM Client Config

```json
{
  "mcpServers": {
    "opspilot": {
      "command": "node",
      "args": [
        "C:/Users/gupo9/RiderProjects/Solution1-frontend-skill-test/mcp-server/dist/index.js"
      ],
      "env": {
        "OPSPILOT_API_BASE": "http://localhost:8080/api"
      }
    }
  }
}
```

## Tools

Read tools:

- `list_incidents`
- `get_incident_detail`
- `search_incidents`
- `list_runbooks`
- `get_dashboard_summary`
- `list_analysis_results`

Response tools:

- `create_incident`
- `add_incident_log`
- `request_ai_analysis`
- `change_incident_status`
- `create_resolution`
- `save_ai_feedback`

The response tools write to OpsPilot records only. They do not restart servers, trigger deployments, roll back releases, or execute shell commands.

