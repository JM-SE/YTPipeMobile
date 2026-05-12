param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ExpoArgs
)

$ErrorActionPreference = 'Stop'

function Find-JavaHome {
  $candidates = @(
    $env:JAVA_HOME,
    'C:\Program Files\Android\Android Studio\jbr',
    'C:\Program Files\Android\Android Studio\jre',
    'C:\Program Files\Java\jdk-21',
    'C:\Program Files\Java\jdk-17'
  ) | Where-Object { $_ }

  foreach ($candidate in $candidates) {
    $javaExe = Join-Path $candidate 'bin\java.exe'
    if (Test-Path -LiteralPath $javaExe) {
      return $candidate
    }
  }

  return $null
}

$javaHome = Find-JavaHome

if (-not $javaHome) {
  Write-Error 'Java was not found. Install Android Studio or a JDK, then set JAVA_HOME to the JDK/JBR directory.'
  exit 1
}

$env:JAVA_HOME = $javaHome
$env:Path = "$(Join-Path $javaHome 'bin');$env:Path"

$googleServicesFile = Join-Path (Get-Location) 'google-services.json'
$isHelpCommand = $ExpoArgs -contains '--help' -or $ExpoArgs -contains '-h'

if (-not $isHelpCommand -and -not (Test-Path -LiteralPath $googleServicesFile)) {
  Write-Error "Missing google-services.json. Create/download it from Firebase for Android package com.ytpipe.mobile and place it at: $googleServicesFile"
  exit 1
}

& npx expo run:android @ExpoArgs
exit $LASTEXITCODE
