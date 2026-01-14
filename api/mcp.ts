import type { VercelRequest, VercelResponse } from '@vercel/node';
import { githubReadFile, githubWriteFile, githubListFiles, githubCreatePR } from '../lib/github.js';
import { supabaseQuery, supabaseInsert, supabaseUpdate, supabaseDelete } from '../lib/supabase.js';
import { vercelDeploy, vercelGetDeployment, vercelListProjects } from '../lib/vercel.js';

// Define all tools
const TOOLS = [
  {
    name: 'github_read_file',
    description: 'Read a file from a GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string', description: 'Repository owner' },
        repo: { type: 'string', description: 'Repository name' },
        path: { type: 'string', description: 'File path' },
        ref: { type: 'string', description: 'Branch/tag/commit (optional)' }
      },
      required: ['owner', 'repo', 'path']
    }
  },
  {
    name: 'github_write_file',
    description: 'Create or update a file in a GitHub repository',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        path: { type: 'string' },
        content: { type: 'string' },
        message: { type: 'string' },
        branch: { type: 'string' },
        sha: { type: 'string', description: 'SHA to update (optional)' }
      },
      required: ['owner', 'repo', 'path', 'content', 'message', 'branch']
    }
  },
  {
    name: 'github_list_files',
    description: 'List files in a GitHub repository directory',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        path: { type: 'string' },
        ref: { type: 'string' }
      },
      required: ['owner', 'repo']
    }
  },
  {
    name: 'github_create_pr',
    description: 'Create a pull request',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        title: { type: 'string' },
        body: { type: 'string' },
        head: { type: 'string' },
        base: { type: 'string' }
      },
      required: ['owner', 'repo', 'title', 'head', 'base']
    }
  },
  {
    name: 'supabase_query',
    description: 'Query data from Supabase',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string' },
        select: { type: 'string' },
        filters: { type: 'object' },
        limit: { type: 'number' }
      },
      required: ['table']
    }
  },
  {
    name: 'supabase_insert',
    description: 'Insert data into Supabase',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string' },
        data: { type: 'object' }
      },
      required: ['table', 'data']
    }
  },
  {
    name: 'supabase_update',
    description: 'Update data in Supabase',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string' },
        filters: { type: 'object' },
        data: { type: 'object' }
      },
      required: ['table', 'filters', 'data']
    }
  },
  {
    name: 'supabase_delete',
    description: 'Delete data from Supabase',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string' },
        filters: { type: 'object' }
      },
      required: ['table', 'filters']
    }
  },
  {
    name: 'vercel_deploy',
    description: 'Trigger a Vercel deployment',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string' },
        gitSource: { type: 'object' }
      },
      required: ['projectId']
    }
  },
  {
    name: 'vercel_get_deployment',
    description: 'Get Vercel deployment details',
    inputSchema: {
      type: 'object',
      properties: {
        deploymentId: { type: 'string' }
      },
      required: ['deploymentId']
    }
  },
  {
    name: 'vercel_list_projects',
    description: 'List Vercel projects',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number' }
      }
    }
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // SSE for GET
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(': keepalive\n\n');
    
    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);
    
    req.on('close', () => {
      clearInterval(keepAlive);
      res.end();
    });
    return;
  }

  // Handle POST messages
  if (req.method === 'POST') {
    try {
      const message = req.body;
      
      // Initialize
      if (message.method === 'initialize') {
        return res.json({
          jsonrpc: '2.0',
          id: message.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: {
              name: 'buddy-mcp-server',
              version: '1.0.0'
            }
          }
        });
      }
      
      // List tools
      if (message.method === 'tools/list') {
        return res.json({
          jsonrpc: '2.0',
          id: message.id,
          result: { tools: TOOLS }
        });
      }
      
      // Call tool
      if (message.method === 'tools/call') {
        const { name, arguments: args } = message.params;
        let result;
        
        switch (name) {
          case 'github_read_file':
            result = await githubReadFile(args);
            break;
          case 'github_write_file':
            result = await githubWriteFile(args);
            break;
          case 'github_list_files':
            result = await githubListFiles(args);
            break;
          case 'github_create_pr':
            result = await githubCreatePR(args);
            break;
          case 'supabase_query':
            result = await supabaseQuery(args);
            break;
          case 'supabase_insert':
            result = await supabaseInsert(args);
            break;
          case 'supabase_update':
            result = await supabaseUpdate(args);
            break;
          case 'supabase_delete':
            result = await supabaseDelete(args);
            break;
          case 'vercel_deploy':
            result = await vercelDeploy(args);
            break;
          case 'vercel_get_deployment':
            result = await vercelGetDeployment(args);
            break;
          case 'vercel_list_projects':
            result = await vercelListProjects(args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
        
        return res.json({
          jsonrpc: '2.0',
          id: message.id,
          result
        });
      }
      
      return res.json({ jsonrpc: '2.0', id: message.id, result: {} });
      
    } catch (error: any) {
      return res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: error.message }
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}