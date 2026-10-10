param(
  [string] $SourceRoot = 'src/assets',
  [string] $OutputRoot = 'src/assets/delivery'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $SourceRoot).Path
$outputPath = [System.IO.Path]::GetFullPath($OutputRoot)
if ($outputPath.StartsWith($sourcePath + [System.IO.Path]::DirectorySeparatorChar) -eq $false) {
  throw 'The delivery directory must be inside the source asset directory.'
}

$assets = @(
  @{ Input = 'brand/pupcast-logo.png'; Output = 'brand/pupcast-logo.png'; Width = 160 }
  @{ Input = 'character/master-bichon.png'; Output = 'character/master-bichon.png'; Width = 768 }
)
foreach ($directory in @('character/outfits', 'character/weather')) {
  Get-ChildItem -LiteralPath (Join-Path $sourcePath $directory) -Filter '*.png' -File | ForEach-Object {
    $relative = "$directory/$($_.Name)"
    $assets += @{ Input = $relative; Output = $relative; Width = 768 }
  }
}

foreach ($asset in $assets) {
  $inputFile = Join-Path $sourcePath $asset.Input
  $outputFile = Join-Path $outputPath $asset.Output
  if (Test-Path -LiteralPath $outputFile) {
    throw "Refusing to overwrite an existing delivery image: $outputFile"
  }
  $source = [System.Drawing.Bitmap]::new($inputFile)
  try {
    $height = [int][Math]::Round($source.Height * $asset.Width / $source.Width)
    $destination = [System.Drawing.Bitmap]::new($asset.Width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($destination)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $asset.Width, $height)
      } finally {
        $graphics.Dispose()
      }
      $parent = Split-Path -Parent $outputFile
      New-Item -ItemType Directory -Path $parent -Force | Out-Null
      $destination.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
      $size = (Get-Item -LiteralPath $outputFile).Length
      Write-Output "$($asset.Output): $($asset.Width)x$height, $size bytes"
    } finally {
      $destination.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}
