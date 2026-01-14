const VERCEL_API = 'https://api.vercel.com';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

async function vercelFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${VERCEL_API}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vercel API error: ${error}`);
  }

  return response.json() as Promise<any>;
}

export async function vercelDeploy(args: any) {
  try {
    const { projectId, gitSource } = args;
    
    const data: any = await vercelFetch('/v13/deployments', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        target: 'production',
        ...(gitSource && { gitSource })
      })
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            id: data.id,
            url: data.url,
            state: data.readyState
          }, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`Vercel deploy error: ${error.message}`);
  }
}

export async function vercelGetDeployment(args: any) {
  try {
    const { deploymentId } = args;
    
    const data: any = await vercelFetch(`/v13/deployments/${deploymentId}`);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            id: data.id,
            url: data.url,
            state: data.readyState,
            createdAt: data.createdAt,
            buildingAt: data.buildingAt,
            ready: data.ready
          }, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`Vercel get deployment error: ${error.message}`);
  }
}

export async function vercelListProjects(args: any) {
  try {
    const { limit = 20 } = args;
    
    const data: any = await vercelFetch(`/v9/projects?limit=${limit}`);

    const projects = data.projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      framework: p.framework,
      updatedAt: p.updatedAt
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(projects, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`Vercel list projects error: ${error.message}`);
  }
}
