param(
  [Parameter(Mandatory = $true)]
  [string] $Base,

  [Parameter(Mandatory = $true)]
  [string[]] $Layers,

  [Parameter(Mandatory = $true)]
  [string] $Output
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outputPath = [System.IO.Path]::GetFullPath($Output)
if (Test-Path -LiteralPath $outputPath) {
  throw "Refusing to overwrite existing preview: $outputPath"
}

$inputPaths = @($Base) + $Layers
$images = @()
try {
  foreach ($path in $inputPaths) {
    $resolved = (Resolve-Path -LiteralPath $path).Path
    $image = [System.Drawing.Bitmap]::new($resolved)
    if ($image.Width -ne 1024 -or $image.Height -ne 1536) {
      $image.Dispose()
      throw "Unexpected canvas size: $resolved"
    }
    $images += $image
  }

  $preview = [System.Drawing.Bitmap]::new(1024, 1536, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($preview)
    try {
      $graphics.Clear([System.Drawing.Color]::FromArgb(244, 248, 252))
      $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
      foreach ($image in $images) {
        $graphics.DrawImageUnscaled($image, 0, 0)
      }
    }
    finally {
      $graphics.Dispose()
    }

    $preview.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $preview.Dispose()
  }
}
finally {
  foreach ($image in $images) {
    $image.Dispose()
  }
}

Write-Output $outputPath
