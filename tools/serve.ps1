# เปิดเว็บเซิร์ฟเวอร์ในเครื่องสำหรับทดสอบเกม:  powershell -ExecutionPolicy Bypass -File game\tools\serve.ps1
# แล้วเปิด http://localhost:8765/
# (หน้า tools/bake.html ใช้ POST /save/<ชื่อไฟล์> เพื่อบันทึกไฟล์ที่สร้างลงโฟลเดอร์ game)
param([int]$port = 8765)
$root = Split-Path $PSScriptRoot
$types = @{'.html'='text/html; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.png'='image/png';'.jpg'='image/jpeg';'.css'='text/css';'.json'='application/json'}
$l = New-Object Net.HttpListener; $l.Prefixes.Add("http://localhost:$port/"); $l.Start()
Write-Host "serving $root on http://localhost:$port/"
while ($l.IsListening) {
  $c = $l.GetContext(); $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/')); if (!$p) { $p = 'index.html' }
  try {
    if ($c.Request.HttpMethod -eq 'POST' -and $p -match '^save/([A-Za-z0-9_\-\.]+)$') {
      $name = $Matches[1]; $ms = New-Object IO.MemoryStream; $c.Request.InputStream.CopyTo($ms)
      [IO.File]::WriteAllBytes((Join-Path $root $name), $ms.ToArray())
      Write-Host "saved $name ($([int]($ms.Length/1KB)) KB)"
      $c.Response.StatusCode = 200
    } else {
      $f = Join-Path $root $p
      if ((Test-Path $f -PathType Leaf) -and ([IO.Path]::GetFullPath($f).StartsWith($root))) {
        $b = [IO.File]::ReadAllBytes($f); $ext = [IO.Path]::GetExtension($f).ToLower()
        $c.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
        $c.Response.Headers.Add('Cache-Control','no-store')
        $c.Response.OutputStream.Write($b, 0, $b.Length)
      } else { $c.Response.StatusCode = 404 }
    }
  } catch { Write-Host $_ }
  $c.Response.Close()
}
