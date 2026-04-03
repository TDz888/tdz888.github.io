#!/usr/bin/env node

// Script gửi thông báo khi VPS được tạo
// Dùng cho Telegram, Discord, Slack,...

const https = require('https');

// Cấu hình (đặt trong env)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function sendTelegram(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('⚠️ Telegram not configured');
        return;
    }
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const data = JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
    });
    
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };
    
    const req = https.request(url, options, (res) => {
        console.log(`✅ Telegram sent: ${res.statusCode}`);
    });
    
    req.write(data);
    req.end();
}

// Đọc thông tin từ command line
const args = process.argv.slice(2);
const vmInfo = {
    ip: args[0] || 'Unknown',
    user: args[1] || 'Unknown',
    pass: args[2] || 'Unknown',
    os: args[3] || 'Unknown'
};

const message = `
🚀 <b>VPS GENERATOR - NEW VPS CREATED</b>
━━━━━━━━━━━━━━━━━━━━
🖥️ OS: ${vmInfo.os}
🌍 IP: ${vmInfo.ip}
👤 User: ${vmInfo.user}
🔑 Pass: <code>${vmInfo.pass}</code>
━━━━━━━━━━━━━━━━━━━━
⏰ Time: ${new Date().toLocaleString()}
`;

sendTelegram(message);
console.log('📨 Notification sent');
