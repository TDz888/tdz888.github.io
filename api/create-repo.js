export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Thieu GitHub token' });
  }

  try {
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = await userRes.json();
    if (!user.login) throw new Error('Token khong hop le');

    const owner = user.login;
    const repoName = `vps-${Date.now()}`;

    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: repoName,
        private: false,
        auto_init: true,
        description: 'VPS Generator'
      })
    });

    if (!createRes.ok) throw new Error('Tao repo that bai');

    const workflowYaml = `name: VPS Deploy

on:
  workflow_dispatch:
    inputs:
      duration:
        description: 'Thoi gian (phut)'
        required: true
        default: '120'
      target_os:
        description: 'He dieu hanh'
        required: true
        default: 'windows'

jobs:
  windows:
    runs-on: windows-latest
    if: github.event.inputs.target_os == 'windows'
    timeout-minutes: 360
    steps:
      - name: Enable RDP
        run: |
          Set-ItemProperty -Path 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' -Name "fDenyTSConnections" -Value 0 -Force
          netsh advfirewall firewall add rule name="RDP" dir=in action=allow protocol=TCP localport=3389
      - name: Create User
        run: |
          $user = "vps_" + (Get-Random -Minimum 1000 -Maximum 9999)
          $pass = -join (((65..90) + (97..122) + (48..57)) | Get-Random -Count 14 | ForEach-Object {[char]$_})
          net user $user $pass /add
          net localgroup Administrators $user /add
          echo "VM_USER=$user" >> $env:GITHUB_ENV
          echo "VM_PASS=$pass" >> $env:GITHUB_ENV
      - name: Get IP
        run: |
          $ip = (Invoke-WebRequest -Uri https://api.ipify.org -UseBasicParsing).Content
          echo "PUBLIC_IP=$ip" >> $env:GITHUB_ENV
      - name: Show Info
        run: |
          Write-Host "========================================="
          Write-Host "VPS READY - WINDOWS"
          Write-Host "IP: $env:PUBLIC_IP"
          Write-Host "User: $env:VM_USER"
          Write-Host "Password: $env:VM_PASS"
          Write-Host "Port RDP: 3389"
          Write-Host "========================================="
      - name: Keep Alive
        run: |
          $dur = [int]"\${{ github.event.inputs.duration }}"
          $end = (Get-Date).AddMinutes($dur)
          while ((Get-Date) -lt $end) {
            Start-Sleep -Seconds 60
          }

  ubuntu:
    runs-on: ubuntu-latest
    if: github.event.inputs.target_os == 'ubuntu'
    timeout-minutes: 360
    steps:
      - name: Setup SSH
        run: |
          sudo apt update -qq
          sudo apt install -y -qq openssh-server curl
          sudo systemctl enable ssh
          sudo systemctl start ssh
      - name: Create User
        run: |
          USER="vps_\$((RANDOM % 9000 + 1000))"
          PASS=\$(openssl rand -base64 14 | tr -d '=+/' | cut -c1-14)
          sudo useradd -m -s /bin/bash "\$USER"
          echo "\$USER:\$PASS" | sudo chpasswd
          sudo usermod -aG sudo "\$USER"
          echo "VM_USER=\$USER" >> \$GITHUB_ENV
          echo "VM_PASS=\$PASS" >> \$GITHUB_ENV
      - name: Get IP
        run: |
          IP=\$(curl -s https://api.ipify.org)
          echo "PUBLIC_IP=\$IP" >> \$GITHUB_ENV
      - name: Show Info
        run: |
          echo "========================================="
          echo "VPS READY - UBUNTU"
          echo "IP: \$PUBLIC_IP"
          echo "User: \$VM_USER"
          echo "Password: \$VM_PASS"
          echo "Port SSH: 22"
          echo "========================================="
      - name: Keep Alive
        run: |
          DUR=\${{ github.event.inputs.duration }}
          END=\$(( \$(date +%s) + DUR * 60 ))
          while [ \$(date +%s) -lt \$END ]; do sleep 60; done
`;

    const content = Buffer.from(workflowYaml).toString('base64');
    await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/.github/workflows/deploy.yml`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Add VPS workflow',
        content: content,
        branch: 'main'
      })
    });

    res.status(200).json({ success: true, owner: owner, repo: repoName });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
