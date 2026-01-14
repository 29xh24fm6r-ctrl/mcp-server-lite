import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// GitHub tools
import { githubReadFile, githubWriteFile, githubListFiles, githubCreatePR } from '../lib/github.js';

// Supabase tools
import { supabaseQuery, supabaseInsert, supabaseUpdate, supabaseDelete } from '../lib/supabase.js';

// Vercel tools
import { vercelDeploy, vercelGetDeployment, vercelListProjects } from '../lib/vercel.js';

// Create MCP server
const server = new Server(
  {
    name: "mcp-server-lite",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // GitHub Tools
      {
        name: "github_read_file",
        description: "Read a file from a GitHub repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string", description: "Repository owner" },
            repo: { type: "string", description: "Repository name" },
            path: { type: "string", description: "File path in the repository" },
            ref: { type: "string", description: "Branch, tag, or commit SHA (optional)" }
          },
          required: ["owner", "repo", "path"]
        }
      },
      {
        name: "github_write_file",
        description: "Create or update a file in a GitHub repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string" },
            repo: { type: "string" },
            path: { type: "string" },
            content: { type: "string" },
            message: { type: "string" },
            branch: { type: "string" },
            sha: { type: "string", description: "SHA of file to update (optional)" }
          },
          required: ["owner", "repo", "path", "content", "message", "branch"]
        }
      },
      {
        name: "github_list_files",
        description: "List files in a GitHub repository directory",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string" },
            repo: { type: "string" },
            path: { type: "string", description: "Directory path (optional)" },
            ref: { type: "string" }
          },
          required: ["owner", "repo"]
        }
      },
      {
        name: "github_create_pr",
        description: "Create a pull request in a GitHub repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string" },
            repo: { type: "string" },
            title: { type: "string" },
            body: { type: "string" },
            head: { type: "string", description: "The name of the branch where your changes are" },
            base: { type: "string", description: "The name of the branch you want to merge into" }
          },
          required: ["owner", "repo", "title", "head", "base"]
        }
      },
      
      // Supabase Tools
      {
        name: "supabase_query",
        description: "Query data from a Supabase table",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            select: { type: "string", description: "Columns to select (default: '*')" },
            filters: { type: "object", description: "Filter conditions" },
            limit: { type: "number" }
          },
          required: ["table"]
        }
      },
      {
        name: "supabase_insert",
        description: "Insert data into a Supabase table",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            data: { type: "object", description: "Data to insert" }
          },
          required: ["table", "data"]
        }
      },
      {
        name: "supabase_update",
        description: "Update data in a Supabase table",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            filters: { type: "object", description: "Filter conditions" },
            data: { type: "object", description: "Data to update" }
          },
          required: ["table", "filters", "data"]
        }
      },
      {
        name: "supabase_delete",
        description: "Delete data from a Supabase table",
        inputSchema: {
          type: "object",
          properties: {
            table: { type: "string" },
            filters: { type: "object", description: "Filter conditions" }
          },
          required: ["table", "filters"]
        }
      },
      
      // Vercel Tools
      {
        name: "vercel_deploy",
        description: "Trigger a deployment on Vercel",
        inputSchema: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            gitSource: { 
              type: "object",
              properties: {
                type: { type: "string", enum: ["github"] },
                ref: { type: "string" },
                repoId: { type: "string" }
              }
            }
          },
          required: ["projectId"]
        }
      },
      {
        name: "vercel_get_deployment",
        description: "Get details about a Vercel deployment",
        inputSchema: {
          type: "object",
          properties: {
            deploymentId: { type: "string" }
          },
          required: ["deploymentId"]
        }
      },
      {
        name: "vercel_list_projects",
        description: "List all Vercel projects",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Maximum number of projects to return" }
          }
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // GitHub tools
      case "github_read_file":
        return await githubReadFile(args);
      case "github_write_file":
        return await githubWriteFile(args);
      case "github_list_files":
        return await githubListFiles(args);
      case "github_create_pr":
        return await githubCreatePR(args);
      
      // Supabase tools
      case "supabase_query":
        return await supabaseQuery(args);
      case "supabase_insert":
        return await supabaseInsert(args);
      case "supabase_update":
        return await supabaseUpdate(args);
      case "supabase_delete":
        return await supabaseDelete(args);
      
      // Vercel tools
      case "vercel_deploy":
        return await vercelDeploy(args);
      case "vercel_get_deployment":
        return await vercelGetDeployment(args);
      case "vercel_list_projects":
        return await vercelListProjects(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ]
    };
  }
});

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle MCP message
    const message = req.body;
    
    // Create a simple transport that captures responses
    let responseData: any = null;
    
    const transport = {
      async start() {},
      async send(msg: any) {
        responseData = msg;
      },
      async close() {}
    };

    // Process the message through the server
    if (message.method === 'tools/list') {
      const handler = server['requestHandlers'].get('tools/list');
      if (handler) {
        responseData = await handler(message);
      }
    } else if (message.method === 'tools/call') {
      const handler = server['requestHandlers'].get('tools/call');
      if (handler) {
        responseData = await handler(message);
      }
    }

    return res.status(200).json(responseData || { error: 'No response' });
  } catch (error: any) {
    console.error('MCP Server Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
