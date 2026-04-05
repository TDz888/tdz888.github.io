const axios = require('axios');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { duration = '2h', target_os = 'windows', telegram_notify = true, auto_cleanup = true } = req.body;
  
  // Lấy token từ environment variable (phải set trong Vercel)
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'TDz888';  // Thay bằng username của bạn
  const REPO_NAME = 'vps-generator';  // Thay bằng tên repo chứa workflow
  
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }
  
  try {
    const response = await axios.post(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/vps-generator.yml/dispatches`,
      {
        ref: 'main',
        inputs: {
          duration,
          target_os,
          telegram_notify,
          auto_cleanup
        }
      },
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'VPS creation started! Check Telegram in 2-3 minutes.' 
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.message || error.message 
    });
  }
};
