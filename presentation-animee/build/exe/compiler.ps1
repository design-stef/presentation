# Fabrique « Presentation Mobilier urbain.exe » : un seul fichier qui contient toute la présentation.
# Usage (après node build/build.mjs) : powershell -ExecutionPolicy Bypass -File build\exe\compiler.ps1
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$P = Resolve-Path (Join-Path $here '..\..')
$stage = Join-Path $env:TEMP 'deck-exe-stage'
if (Test-Path $stage) { Remove-Item -Recurse -Force -LiteralPath $stage }
New-Item -ItemType Directory -Force "$stage\composition\assets\img", "$stage\composition\assets\fonts", "$stage\composition\assets\js", "$stage\lib" | Out-Null

# uniquement ce qu'il faut pour présenter
Copy-Item -LiteralPath "$P\index.html" -Destination $stage
Copy-Item -LiteralPath "$P\composition\index.html" -Destination "$stage\composition"
Copy-Item "$P\lib\*" "$stage\lib"
Copy-Item "$P\composition\assets\fonts\*" "$stage\composition\assets\fonts"
Copy-Item "$P\composition\assets\js\*" "$stage\composition\assets\js"
$html = Get-Content -Raw "$P\composition\index.html"
Get-ChildItem "$P\composition\assets\img\*.jpg" | Where-Object { $html.Contains($_.Name) } | Copy-Item -Destination "$stage\composition\assets\img"

$zip = Join-Path $env:TEMP 'presentation.zip'
if (Test-Path $zip) { Remove-Item -LiteralPath $zip }
Compress-Archive -Path "$stage\*" -DestinationPath $zip

$out = Join-Path (Split-Path -Parent $P) 'Presentation Mobilier urbain.exe'
$csc = "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$fw = "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319"
& $csc /nologo /target:exe /platform:anycpu /optimize+ "/out:$out" "/resource:$zip,presentation.zip" `
  "/reference:$fw\System.IO.Compression.dll" "/reference:$fw\System.IO.Compression.FileSystem.dll" "$here\Lanceur.cs"
if ($LASTEXITCODE -ne 0) { throw "compilation echouee" }
Get-Item -LiteralPath $out | Select-Object Name, @{ n = 'Mo'; e = { [math]::Round($_.Length / 1MB, 1) } }
