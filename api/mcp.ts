import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // SSE endpoint for MCP
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send initialization
    const initMessage = {
      jsonrpc: '2.0',
      method: 'server/initialized',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'buddy-mcp-server',
          version: '1.0.0'
        }
      }
    };
    
    res.write(`data: ${JSON.stringify(initMessage)}\n\n`);
    
    // Keep alive
    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);
    
    req.on('close', () => {
      clearInterval(keepAlive);
      res.end();
    });
    
    return;
  }

  // POST endpoint for messages
  if (req.method === 'POST') {
    try {
      const message = req.body;
      
      // Handle initialize
      if (message.method === 'initialize') {
        return res.json({
          jsonrpc: '2.0',
          id: message.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'buddy-mcp-server',
              version: '1.0.0'
            }
          }
        });
      }
      
      // Handle tools/list
      if (message.method === 'tools/list') {
        return res.json({
          jsonrpc: '2.0',
          id: message.id,
          result: {
            tools: [
              {
                name: 'test_tool',
                description: 'A test tool',
                inputSchema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' }
                  }
                }
              }
            ]
          }
        });
      }
      
      // Default response
      return res.json({
        jsonrpc: '2.0',
        id: message.id,
        result: {}
      });
      
    } catch (error: any) {
      return res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error.message
        }
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}