import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export async function githubReadFile(args: any) {
  try {
    const { owner, repo, path, ref } = args;
    
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref
    });

    if ('content' in response.data && typeof response.data.content === 'string') {
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return {
        content: [
          {
            type: "text",
            text: content
          }
        ]
      };
    }

    return {
      content: [
        {
          type: "text",
          text: "File not found or is a directory"
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`GitHub read file error: ${error.message}`);
  }
}

export async function githubWriteFile(args: any) {
  try {
    const { owner, repo, path, content, message, branch, sha } = args;
    
    const response = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
      ...(sha && { sha })
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`GitHub write file error: ${error.message}`);
  }
}

export async function githubListFiles(args: any) {
  try {
    const { owner, repo, path = '', ref } = args;
    
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ...(ref && { ref })
    });

    const files = Array.isArray(response.data) 
      ? response.data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size
        }))
      : [response.data];

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(files, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`GitHub list files error: ${error.message}`);
  }
}

export async function githubCreatePR(args: any) {
  try {
    const { owner, repo, title, body, head, base } = args;
    
    const response = await octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            number: response.data.number,
            url: response.data.html_url,
            state: response.data.state
          }, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw new Error(`GitHub create PR error: ${error.message}`);
  }
}
