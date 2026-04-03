export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, owner, repo, duration, target_os, tailscale_token } = req.body;

  if (!token || !owner || !repo) {
    return res.status(400).json({ error: 'Thiếu thông tin GitHub' });
  }

  try {
    const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/deploy.yml/dispatches`;
    
    const inputs = {
      duration: duration,
      target_os: target_os
    };
    
    if (tailscale_token) {
      inputs.tailscale_token = tailscale_token;
    }

    const response = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: inputs
      })
    });

    if (response.ok) {
      res.status(200).json({ 
        success: true, 
        message: 'VM đang được khởi tạo (2-3 phút sau có thông tin)'
      });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({ error: `GitHub API lỗi: ${errorText}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
