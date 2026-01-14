# MCP Server Lite

A lightweight Model Context Protocol (MCP) server with GitHub, Supabase, and Vercel integrations.

## Features

- 🔧 **GitHub Tools**: Read/write files, list directories, create PRs
- 💾 **Supabase Tools**: Query, insert, update, delete data
- 🚀 **Vercel Tools**: Deploy projects, get deployment status, list projects

## Quick Deploy to Vercel

1. **Clone this repository**
2. **Install Vercel CLI**: `npm i -g vercel`
3. **Login to Vercel**: `vercel login`
4. **Deploy**: `vercel --prod`
5. **Add environment variables** in Vercel dashboard:
   - `GITHUB_TOKEN` - Your GitHub personal access token
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `VERCEL_TOKEN` - Your Vercel API token

## Connect to Claude

Once deployed, use your MCP server URL in Claude:

```
https://your-project.vercel.app/api/mcp
```

Add this as a custom connector in Claude Settings → Connectors.

## Local Development

```bash
npm install
npm run dev
```

## Available Tools

### GitHub
- `github_read_file` - Read file contents
- `github_write_file` - Create or update files
- `github_list_files` - List directory contents
- `github_create_pr` - Create pull requests

### Supabase
- `supabase_query` - Query table data
- `supabase_insert` - Insert new records
- `supabase_update` - Update existing records
- `supabase_delete` - Delete records

### Vercel
- `vercel_deploy` - Trigger deployments
- `vercel_get_deployment` - Get deployment details
- `vercel_list_projects` - List all projects

## License

MIT
