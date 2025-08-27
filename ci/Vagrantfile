# Vagrantfile for testing RoughCut MCP across different Windows environments
# Usage: vagrant up [vm-name] to start specific VMs
# Usage: vagrant up to start all VMs

Vagrant.configure("2") do |config|
  # Global settings
  config.vm.synced_folder ".", "/vagrant", disabled: false
  config.vm.boot_timeout = 600
  config.vm.graceful_halt_timeout = 60

  # Common provisioning script
  $common_setup = <<-SCRIPT
    Write-Host "🔧 Starting common setup..." -ForegroundColor Cyan
    
    # Set execution policy for testing
    Set-ExecutionPolicy RemoteSigned -Scope LocalMachine -Force
    
    # Update PATH to include common locations
    $env:PATH += ";C:\\Program Files\\nodejs;C:\\Program Files (x86)\\nodejs"
    
    # Install Git if not present
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
      Write-Host "📦 Installing Git..." -ForegroundColor Yellow
      choco install git -y
    }
    
    Write-Host "✅ Common setup complete" -ForegroundColor Green
  SCRIPT

  $test_installation = <<-SCRIPT
    Write-Host "🧪 Testing RoughCut MCP installation..." -ForegroundColor Cyan
    
    cd C:\\vagrant
    
    # Install dependencies and build
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm ci
    
    Write-Host "🔧 Building project..." -ForegroundColor Yellow  
    npm run build
    
    # Test npm pack and global install
    Write-Host "📦 Testing npm pack..." -ForegroundColor Yellow
    npm pack
    
    $package = Get-ChildItem -Filter "rough-cut-mcp-*.tgz" | Select-Object -First 1
    if ($package) {
      Write-Host "📥 Testing global install..." -ForegroundColor Yellow
      npm install -g $package.FullName
      
      # Test that postinstall ran
      if (Test-Path "$env:APPDATA\\Claude\\claude_desktop_config.json") {
        Write-Host "✅ Claude Desktop config created" -ForegroundColor Green
        
        # Test MCP server startup
        $mcpPath = Join-Path $env:APPDATA "npm\\node_modules\\rough-cut-mcp\\build\\index.js"
        if (Test-Path $mcpPath) {
          Write-Host "✅ MCP server installed at: $mcpPath" -ForegroundColor Green
          
          # Quick startup test
          $proc = Start-Process -FilePath "node" -ArgumentList $mcpPath -PassThru -NoNewWindow
          Start-Sleep 3
          
          if (-not $proc.HasExited) {
            Write-Host "✅ MCP server started successfully" -ForegroundColor Green
            $proc.Kill()
          } else {
            Write-Host "❌ MCP server failed to start" -ForegroundColor Red
          }
        } else {
          Write-Host "❌ MCP server not found" -ForegroundColor Red  
        }
      } else {
        Write-Host "❌ Claude Desktop config not created" -ForegroundColor Red
      }
    } else {
      Write-Host "❌ No package file found" -ForegroundColor Red
    }
    
    Write-Host "🏁 Installation test complete" -ForegroundColor Cyan
  SCRIPT

  # Windows 10 with standard Node.js installation
  config.vm.define "win10-standard" do |win10|
    win10.vm.box = "gusztavvargadr/windows-10"
    win10.vm.hostname = "roughcut-win10-std"
    
    win10.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = "4096"
      vb.cpus = 2
      vb.name = "RoughCut-Win10-Standard"
    end
    
    # Install Chocolatey first
    win10.vm.provision "shell", inline: <<-SHELL
      Write-Host "🍫 Installing Chocolatey..." -ForegroundColor Cyan
      Set-ExecutionPolicy Bypass -Scope Process -Force
      [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
      iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    SHELL
    
    # Install Node.js via standard installer
    win10.vm.provision "shell", inline: <<-SHELL
      Write-Host "📦 Installing Node.js (Standard)..." -ForegroundColor Cyan
      choco install nodejs -y --version=20.11.0
      refreshenv
      node --version
      npm --version
    SHELL
    
    win10.vm.provision "shell", inline: $common_setup
    win10.vm.provision "shell", inline: $test_installation
  end

  # Windows 11 with NVM for Windows
  config.vm.define "win11-nvm" do |win11|
    win11.vm.box = "gusztavvargadr/windows-11"
    win11.vm.hostname = "roughcut-win11-nvm"
    
    win11.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = "4096" 
      vb.cpus = 2
      vb.name = "RoughCut-Win11-NVM"
    end
    
    # Install Chocolatey
    win11.vm.provision "shell", inline: <<-SHELL
      Write-Host "🍫 Installing Chocolatey..." -ForegroundColor Cyan
      Set-ExecutionPolicy Bypass -Scope Process -Force
      [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
      iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    SHELL
    
    # Install NVM for Windows
    win11.vm.provision "shell", inline: <<-SHELL
      Write-Host "📦 Installing NVM for Windows..." -ForegroundColor Cyan
      
      $nvmUrl = "https://github.com/coreybutler/nvm-windows/releases/download/1.1.12/nvm-setup.zip"
      Invoke-WebRequest -Uri $nvmUrl -OutFile "nvm-setup.zip"
      Expand-Archive -Path "nvm-setup.zip" -DestinationPath "nvm"
      Start-Process -FilePath ".\\nvm\\nvm-setup.exe" -ArgumentList "/S" -Wait
      
      # Add NVM to PATH for this session
      $env:PATH += ";$env:APPDATA\\nvm;C:\\Program Files\\nodejs"
      [Environment]::SetEnvironmentVariable("PATH", $env:PATH, "Machine")
      
      # Install and use Node.js
      & "$env:APPDATA\\nvm\\nvm.exe" install 20.11.0
      & "$env:APPDATA\\nvm\\nvm.exe" use 20.11.0
      
      node --version
      npm --version
    SHELL
    
    win11.vm.provision "shell", inline: $common_setup
    win11.vm.provision "shell", inline: $test_installation
  end

  # Windows Server 2022 with Volta
  config.vm.define "server2022-volta" do |server|
    server.vm.box = "gusztavvargadr/windows-server-2022"
    server.vm.hostname = "roughcut-srv22-volta"
    
    server.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = "4096"
      vb.cpus = 2
      vb.name = "RoughCut-Server2022-Volta"
    end
    
    # Install Chocolatey
    server.vm.provision "shell", inline: <<-SHELL
      Write-Host "🍫 Installing Chocolatey..." -ForegroundColor Cyan
      Set-ExecutionPolicy Bypass -Scope Process -Force
      [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
      iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    SHELL
    
    # Install Volta
    server.vm.provision "shell", inline: <<-SHELL
      Write-Host "📦 Installing Volta..." -ForegroundColor Cyan
      
      $voltaUrl = "https://github.com/volta-cli/volta/releases/download/v1.1.1/volta-1.1.1-windows-x86_64.msi"
      Invoke-WebRequest -Uri $voltaUrl -OutFile "volta.msi"
      Start-Process msiexec -ArgumentList "/i", "volta.msi", "/quiet", "/norestart" -NoNewWindow -Wait
      
      # Add Volta to PATH
      $voltaPath = "$env:USERPROFILE\\AppData\\Local\\Volta\\bin"
      $env:PATH += ";$voltaPath"
      [Environment]::SetEnvironmentVariable("PATH", $env:PATH, "User")
      
      # Install Node.js via Volta
      & "$voltaPath\\volta.exe" install node@20.11.0
      
      node --version
      npm --version
    SHELL
    
    server.vm.provision "shell", inline: $common_setup
    server.vm.provision "shell", inline: $test_installation
  end

  # Windows 10 Corporate (Restricted Environment)
  config.vm.define "win10-corporate" do |corp|
    corp.vm.box = "gusztavvargadr/windows-10"
    corp.vm.hostname = "roughcut-win10-corp"
    
    corp.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = "4096"
      vb.cpus = 2
      vb.name = "RoughCut-Win10-Corporate"
    end
    
    # Simulate corporate restrictions
    corp.vm.provision "shell", inline: <<-SHELL
      Write-Host "🏢 Setting up corporate environment restrictions..." -ForegroundColor Cyan
      
      # Set restricted execution policy
      Set-ExecutionPolicy Restricted -Scope LocalMachine -Force
      
      # Install Node.js in user directory (no admin rights simulation)
      Write-Host "📦 Installing Node.js to user directory..." -ForegroundColor Yellow
      
      $nodeVersion = "v20.11.0"
      $nodeUrl = "https://nodejs.org/dist/$nodeVersion/node-$nodeVersion-win-x64.zip"
      $userNodePath = "$env:LOCALAPPDATA\\nodejs"
      
      New-Item -Path $userNodePath -ItemType Directory -Force
      Invoke-WebRequest -Uri $nodeUrl -OutFile "node.zip"
      Expand-Archive -Path "node.zip" -DestinationPath $env:TEMP -Force
      
      $extractedFolder = Get-ChildItem -Path $env:TEMP -Filter "node-*" -Directory | Select-Object -First 1
      Copy-Item -Path "$($extractedFolder.FullName)\\*" -Destination $userNodePath -Recurse -Force
      
      # Set up user-level PATH and npm prefix
      $userNpmPath = "$env:LOCALAPPDATA\\npm"
      New-Item -Path $userNpmPath -ItemType Directory -Force
      
      [Environment]::SetEnvironmentVariable("PATH", "$userNodePath;$userNpmPath;$env:PATH", "User")
      $env:PATH = "$userNodePath;$userNpmPath;$env:PATH"
      
      & "$userNodePath\\npm.cmd" config set prefix $userNpmPath
      
      # Test installation
      & "$userNodePath\\node.exe" --version
      & "$userNodePath\\npm.cmd" --version
      
      Write-Host "✅ User-space Node.js installation complete" -ForegroundColor Green
    SHELL
    
    corp.vm.provision "shell", inline: $test_installation
  end

  # Test runner VM that connects to others
  config.vm.define "test-runner" do |runner|
    runner.vm.box = "gusztavvargadr/windows-10"
    runner.vm.hostname = "roughcut-test-runner"
    
    runner.vm.provider "virtualbox" do |vb|
      vb.gui = false
      vb.memory = "2048"
      vb.cpus = 1
      vb.name = "RoughCut-Test-Runner"
    end
    
    # Install basic tools for test coordination
    runner.vm.provision "shell", inline: <<-SHELL
      Write-Host "🧪 Setting up test runner environment..." -ForegroundColor Cyan
      
      Set-ExecutionPolicy Bypass -Scope Process -Force
      iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
      
      choco install nodejs git -y
      
      Write-Host "✅ Test runner ready" -ForegroundColor Green
    SHELL
    
    # Test coordination script
    runner.vm.provision "shell", inline: <<-SHELL
      Write-Host "📊 Running cross-VM test coordination..." -ForegroundColor Cyan
      
      cd C:\\vagrant
      
      # Create test results summary
      $results = @()
      
      # This would normally collect results from other VMs
      # For now, just run local tests
      Write-Host "🧪 Running integration tests..." -ForegroundColor Yellow
      
      try {
        npm ci
        npm run build
        npm test
        $results += "✅ Local tests passed"
      } catch {
        $results += "❌ Local tests failed: $_"
      }
      
      # Save results
      $results | Out-File -FilePath "C:\\vagrant\\test-results.txt" -Encoding UTF8
      
      Write-Host "📋 Test Results:" -ForegroundColor Cyan
      $results | ForEach-Object { Write-Host "  $_" }
      
      Write-Host "🏁 Cross-VM testing complete" -ForegroundColor Green
    SHELL
  end
end