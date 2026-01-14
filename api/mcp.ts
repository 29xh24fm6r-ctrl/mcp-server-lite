import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // For now, return a simple test response
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'MCP Server is running',
      endpoint: '/api/mcp'
    });
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      
      // Echo back the request for testing
      return res.status(200).json({
        jsonrpc: '2.0',
        id: body.id || null,
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