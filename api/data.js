// Vercel serverless function — proxies all GitHub data reads/writes
// Keeps the GitHub PAT server-side only

const GITHUB_API = 'https://api.github.com';

function getEnv() {
  return {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER || 'annakaterussell',
    repo: process.env.GITHUB_REPO || 'comms-impact-tracker',
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

function githubHeaders(token) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
}

export default async function handler(req, res) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { file } = req.query;
  if (!file || !/^[a-z_]+$/.test(file)) {
    return res.status(400).json({ error: 'Invalid file parameter' });
  }

  const { token, owner, repo, branch } = getEnv();
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
  }

  const filePath = `data/${file}.json`;
  const apiUrl = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;

  // ── GET: read a data file ─────────────────────────────────────────────────
  if (req.method === 'GET') {
    const response = await fetch(apiUrl, { headers: githubHeaders(token) });

    if (response.status === 404) {
      return res.status(200).json({ data: [], sha: null });
    }
    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.message });
    }

    const result = await response.json();
    const content = JSON.parse(
      Buffer.from(result.content, 'base64').toString('utf8')
    );
    return res.status(200).json({ data: content, sha: result.sha });
  }

  // ── POST: write a data file ───────────────────────────────────────────────
  if (req.method === 'POST') {
    const { data, sha } = req.body;
    const encoded = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    const body = {
      message: `Update ${file}.json`,
      content: encoded,
      branch,
      ...(sha ? { sha } : {}),
    };

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: githubHeaders(token),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.message });
    }

    const result = await response.json();
    return res.status(200).json({ sha: result.content?.sha });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
