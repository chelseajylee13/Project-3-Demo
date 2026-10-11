param(
  [Parameter(Mandatory = $true)]
  [string[]] $Path
)

Add-Type -AssemblyName System.Drawing

if (-not ('PupcastAlphaInspector' -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class PupcastAlphaInspector
{
    public static string[] Inspect(string path, int[] thresholds)
    {
        using (var source = new Bitmap(path))
        using (var image = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb))
        {
            using (var graphics = Graphics.FromImage(image))
            {
                graphics.DrawImageUnscaled(source, 0, 0);
            }

            var rectangle = new Rectangle(0, 0, image.Width, image.Height);
            var data = image.LockBits(rectangle, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            try
            {
                var bytes = new byte[Math.Abs(data.Stride) * image.Height];
                Marshal.Copy(data.Scan0, bytes, 0, bytes.Length);

                var minX = new int[thresholds.Length];
                var minY = new int[thresholds.Length];
                var maxX = new int[thresholds.Length];
                var maxY = new int[thresholds.Length];
                for (var index = 0; index < thresholds.Length; index++)
                {
                    minX[index] = image.Width;
                    minY[index] = image.Height;
                    maxX[index] = -1;
                    maxY[index] = -1;
                }

                for (var y = 0; y < image.Height; y++)
                {
                    var row = y * data.Stride;
                    for (var x = 0; x < image.Width; x++)
                    {
                        var alpha = bytes[row + (x * 4) + 3];
                        for (var index = 0; index < thresholds.Length; index++)
                        {
                            if (alpha < thresholds[index]) continue;
                            if (x < minX[index]) minX[index] = x;
                            if (y < minY[index]) minY[index] = y;
                            if (x > maxX[index]) maxX[index] = x;
                            if (y > maxY[index]) maxY[index] = y;
                        }
                    }
                }

                var results = new string[thresholds.Length];
                for (var index = 0; index < thresholds.Length; index++)
                {
                    results[index] = String.Format(
                        "alpha>={0}: {1},{2} to {3},{4}",
                        thresholds[index], minX[index], minY[index], maxX[index], maxY[index]);
                }
                return results;
            }
            finally
            {
                image.UnlockBits(data);
            }
        }
    }
}
'@
}

$thresholds = @(1, 5, 10, 20, 40, 80, 128, 200, 240)
foreach ($file in $Path) {
  $resolvedPath = (Resolve-Path -LiteralPath $file).Path
  Write-Output ([System.IO.Path]::GetFileName($resolvedPath))
  [PupcastAlphaInspector]::Inspect($resolvedPath, $thresholds)
}
