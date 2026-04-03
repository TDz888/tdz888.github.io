export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, owner, repo, duration, target_os } = req.body;

  try {
    const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/deploy.yml/dispatches`;
    const response = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: { duration, target_os }
      })
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(response.status).json({ error: 'Dispatch failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
