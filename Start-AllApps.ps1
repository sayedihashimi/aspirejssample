#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Starts all Aspire AppHost projects in the workspace and displays their dashboard URLs.

.DESCRIPTION
    This script discovers all AppHost projects in the workspace, starts them in parallel,
    captures their dashboard URLs, and displays them. Press CTRL+C to stop all apps gracefully.

.PARAMETER Apps
    Optional array of app names to start (e.g., 'react', 'vue'). If not specified, all apps are started.

.PARAMETER Quiet
    Suppress real-time output from the Aspire processes. Only show status messages and dashboard URLs.

.EXAMPLE
    ./Start-AllApps.ps1
    Starts all Aspire apps in the workspace with real-time output.

.EXAMPLE
    ./Start-AllApps.ps1 -Apps react,vue
    Starts only the React and Vue apps.

.EXAMPLE
    ./Start-AllApps.ps1 -Quiet
    Starts all apps without showing their real-time output.
#>

[CmdletBinding()]
param(
    [string[]]$Apps,
    [switch]$Quiet
)

$ErrorActionPreference = 'Stop'

# Get the script's directory (workspace root)
$workspaceRoot = $PSScriptRoot
if (-not $workspaceRoot) {
    $workspaceRoot = Get-Location
}

# Define all available AppHost projects
$allAppHosts = @(
    @{ Name = 'angular';  Project = 'angular\MyAngularApp.AppHost\MyAngularApp.AppHost.csproj' }
    @{ Name = 'astro';    Project = 'astro\MyAstroApp.AppHost\MyAstroApp.AppHost.csproj' }
    @{ Name = 'nextjs';   Project = 'nextjs\MyNextJsApp.AppHost\MyNextJsApp.AppHost.csproj' }
    @{ Name = 'nuxtjs';   Project = 'nuxtjs\MyNuxtApp.AppHost\MyNuxtApp.AppHost.csproj' }
    @{ Name = 'react';    Project = 'react\MyReactApp.AppHost\MyReactApp.AppHost.csproj' }
    @{ Name = 'solid';    Project = 'solid\MySolidApp.AppHost\MySolidApp.AppHost.csproj' }
    @{ Name = 'svelte';   Project = 'svelte\MySvelteApp.AppHost\MySvelteApp.AppHost.csproj' }
    @{ Name = 'vue';      Project = 'vue\MyVueApp.AppHost\MyVueApp.AppHost.csproj' }
)

# Filter apps if specific ones were requested
if ($Apps -and $Apps.Count -gt 0) {
    $selectedApps = $allAppHosts | Where-Object { $Apps -contains $_.Name }
    if ($selectedApps.Count -eq 0) {
        Write-Error "No matching apps found. Available apps: $($allAppHosts.Name -join ', ')"
        exit 1
    }
    $appHostsToStart = $selectedApps
} else {
    $appHostsToStart = $allAppHosts
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Aspire Multi-App Launcher" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Starting $($appHostsToStart.Count) Aspire app(s)...`n" -ForegroundColor Yellow

# Store process information - use script scope for cleanup access
$script:processes = @{}

try {
    # Start each app using Start-Process with output redirection to files
    foreach ($appHost in $appHostsToStart) {
        $projectPath = Join-Path $workspaceRoot $appHost.Project
        
        if (-not (Test-Path $projectPath)) {
            Write-Warning "Project not found: $projectPath"
            continue
        }
        
        Write-Verbose "Starting $($appHost.Name)..."
        
        # Create temporary files to capture output
        $outputFile = Join-Path ([System.IO.Path]::GetTempPath()) "aspire-$($appHost.Name)-out.log"
        $errorFile = Join-Path ([System.IO.Path]::GetTempPath()) "aspire-$($appHost.Name)-err.log"
        
        # Clear any existing log files
        if (Test-Path $outputFile) { Remove-Item $outputFile -Force }
        if (Test-Path $errorFile) { Remove-Item $errorFile -Force }
        
        # Start the process with output redirected to files
        $process = Start-Process -FilePath 'aspire' `
            -ArgumentList "run --project `"$projectPath`"" `
            -WorkingDirectory $workspaceRoot `
            -RedirectStandardOutput $outputFile `
            -RedirectStandardError $errorFile `
            -PassThru `
            -NoNewWindow
        
        $script:processes[$appHost.Name] = @{
            Process = $process
            OutputFile = $outputFile
            ErrorFile = $errorFile
        }
        
        # Small delay between starts to avoid port conflicts
        Start-Sleep -Milliseconds 500
    }
    
    Write-Verbose "Waiting for apps to initialize..."
    
    # Wait for dashboard URLs to appear (with timeout)
    $timeout = 90  # seconds
    $startTime = Get-Date
    $foundUrls = @{}
    $lastOutputLengths = @{}  # Track how much output we've already shown
    
    while ($foundUrls.Count -lt $script:processes.Count -and ((Get-Date) - $startTime).TotalSeconds -lt $timeout) {
        foreach ($procInfo in $script:processes.GetEnumerator()) {
            $appName = $procInfo.Key
            
            # Skip if we've already found the URL for this app
            if ($foundUrls.ContainsKey($appName)) {
                continue
            }
            
            # Read output files
            $output = ''
            $errorOutput = ''
            
            if (Test-Path $procInfo.Value.OutputFile) {
                try {
                    $output = Get-Content $procInfo.Value.OutputFile -Raw -ErrorAction SilentlyContinue
                } catch { }
            }
            if (Test-Path $procInfo.Value.ErrorFile) {
                try {
                    $errorOutput = Get-Content $procInfo.Value.ErrorFile -Raw -ErrorAction SilentlyContinue
                } catch { }
            }
            
            # Combine stdout and stderr
            $combinedOutput = "$output$errorOutput"
            
            # Display new output (unless -Quiet is specified)
            if (-not $Quiet) {
                # Get last known length for this app
                if (-not $lastOutputLengths.ContainsKey($appName)) {
                    $lastOutputLengths[$appName] = 0
                }
                
                # Display new output
                if ($combinedOutput.Length -gt $lastOutputLengths[$appName]) {
                    $newOutput = $combinedOutput.Substring($lastOutputLengths[$appName])
                    $lastOutputLengths[$appName] = $combinedOutput.Length
                    
                    # Display with app prefix
                    $lines = $newOutput -split "`r?`n"
                    foreach ($line in $lines) {
                        if ($line.Trim()) {
                            Write-Host "[$appName] " -NoNewline -ForegroundColor DarkGray
                            Write-Host $line
                        }
                    }
                }
            }
            
            # Look for dashboard URL in combined output
            # The aspire CLI uses OSC 8 hyperlinks: ESC]8;id=...;https://...ESC\
            # So we need to extract the URL from within the OSC 8 escape sequence
            # Pattern: ESC]8;...;URL... or just plain https:// URL
            if ($combinedOutput -match 'Dashboard') {
                # Try to extract URL from OSC 8 hyperlink format: ESC]8;id=xxx;URL
                # The escape sequence is: \x1b]8;id=...;URL\x1b\\  or \x1b]8;id=...;URL\x07
                if ($combinedOutput -match '\x1b\]8;[^;]*;(https?://[^\x1b\x07]+)') {
                    $dashboardUrl = $Matches[1]
                    $dashboardUrl = $dashboardUrl.Trim()
                    $foundUrls[$appName] = $dashboardUrl
                    Write-Verbose "  ✓ $appName dashboard found"
                }
                # Fallback: try plain URL after Dashboard:
                elseif ($combinedOutput -match 'Dashboard:\s*(https?://\S+)') {
                    $dashboardUrl = $Matches[1]
                    # Clean up any trailing control characters
                    $dashboardUrl = $dashboardUrl -replace '[\x00-\x1f].*$', ''
                    $dashboardUrl = $dashboardUrl.Trim()
                    $foundUrls[$appName] = $dashboardUrl
                    Write-Verbose "  ✓ $appName dashboard found"
                }
            }
            
            # Check if process exited unexpectedly
            if ($procInfo.Value.Process.HasExited) {
                Write-Warning "  ✗ $appName exited unexpectedly (exit code: $($procInfo.Value.Process.ExitCode))"
                $foundUrls[$appName] = $null  # Mark as processed but failed
            }
        }
        
        Start-Sleep -Milliseconds 500
    }
    
    # Display summary
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  Dashboard URLs" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $runningApps = @()
    foreach ($appHost in $appHostsToStart) {
        $appName = $appHost.Name
        if ($foundUrls.ContainsKey($appName) -and $foundUrls[$appName]) {
            Write-Host "  $($appName.PadRight(10)) : " -NoNewline -ForegroundColor White
            Write-Host $foundUrls[$appName] -ForegroundColor Green
            $runningApps += $appName
        } elseif ($foundUrls.ContainsKey($appName)) {
            Write-Host "  $($appName.PadRight(10)) : " -NoNewline -ForegroundColor White
            Write-Host "Failed to start" -ForegroundColor Red
        } else {
            Write-Host "  $($appName.PadRight(10)) : " -NoNewline -ForegroundColor White
            Write-Host "Timeout waiting for dashboard" -ForegroundColor Yellow
        }
    }
    
    if ($runningApps.Count -gt 0) {
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "  $($runningApps.Count) app(s) running" -ForegroundColor Green
        Write-Host "  Press CTRL+C to stop all apps" -ForegroundColor Yellow
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        # Keep script running until CTRL+C
        while ($true) {
            # Check if any process has exited
            $stillRunning = $false
            foreach ($procInfo in $script:processes.GetEnumerator()) {
                if (-not $procInfo.Value.Process.HasExited) {
                    $stillRunning = $true
                    break
                }
            }
            
            if (-not $stillRunning) {
                Write-Host "`nAll processes have exited." -ForegroundColor Yellow
                break
            }
            
            Start-Sleep -Seconds 1
        }
    }
    
} finally {
    # Cleanup: Stop all processes
    Write-Host "`nShutting down..." -ForegroundColor Yellow
    
    foreach ($procInfo in $script:processes.GetEnumerator()) {
        $proc = $procInfo.Value.Process
        $appName = $procInfo.Key
        
        if ($proc -and -not $proc.HasExited) {
            Write-Verbose "  Stopping $appName (PID: $($proc.Id))..."
            try {
                # Kill the process tree
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                # Also try to kill any child processes
                Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $proc.Id } | ForEach-Object {
                    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
                }
            } catch {
                # Process may have already exited
            }
        }
        
        # Cleanup log files
        if ($procInfo.Value.OutputFile -and (Test-Path $procInfo.Value.OutputFile)) {
            Remove-Item $procInfo.Value.OutputFile -Force -ErrorAction SilentlyContinue
        }
        if ($procInfo.Value.ErrorFile -and (Test-Path $procInfo.Value.ErrorFile)) {
            Remove-Item $procInfo.Value.ErrorFile -Force -ErrorAction SilentlyContinue
        }
    }
    
    Write-Host "`nAll apps stopped. Goodbye!" -ForegroundColor Green
}
