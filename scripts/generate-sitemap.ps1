param(
  [string]$BaseUrl = "https://delayedcode.github.io/SAO-MC-Interactive-Map",
  [string]$RootPath = "."
)

Set-Location $RootPath
$workspaceRoot = (Resolve-Path ".").Path

$htmlFiles = Get-ChildItem -Recurse -File -Filter *.html |
  Where-Object { $_.FullName -notmatch "\\.git\\|\\.venv\\" }

function Convert-ToUrlPath {
  param([string]$Path)
  $segments = $Path -split "[\\/]"
  $escapedSegments = $segments | ForEach-Object { [Uri]::EscapeDataString($_) }
  return ($escapedSegments -join "/")
}

$today = (Get-Date).ToString("yyyy-MM-dd")
$namespaceUri = 'http://www.sitemaps.org/schemas/sitemap/0.9'

function Write-SitemapUrlEntry {
  param(
    [System.Xml.XmlWriter]$Writer,
    [string]$Location,
    [string]$LastModified,
    [string]$Priority
  )

  $Writer.WriteStartElement("url")
  $Writer.WriteElementString("loc", $Location)
  $Writer.WriteElementString("lastmod", $LastModified)
  $Writer.WriteElementString("changefreq", "weekly")
  $Writer.WriteElementString("priority", $Priority)
  $Writer.WriteEndElement()
}

$xmlSettings = [System.Xml.XmlWriterSettings]::new()
$xmlSettings.Indent = $true
$xmlSettings.Encoding = [System.Text.UTF8Encoding]::new($false)

$writer = [System.Xml.XmlWriter]::Create("sitemap.xml", $xmlSettings)
try {
  $writer.WriteStartDocument()
  $writer.WriteStartElement("urlset", $namespaceUri)

  Write-SitemapUrlEntry -Writer $writer -Location "$BaseUrl/" -LastModified $today -Priority "1.0"

  foreach ($file in $htmlFiles) {
    $relativePath = ($file.FullName.Substring($workspaceRoot.Length) -replace '^[\\/]+', '')
    $relativePath = $relativePath -replace '\\', '/'
    if ($relativePath -ieq "index.html") {
      continue
    }

    $urlPath = Convert-ToUrlPath -Path $relativePath
    Write-SitemapUrlEntry -Writer $writer -Location "$BaseUrl/$urlPath" -LastModified $today -Priority "0.7"
  }

  $writer.WriteEndElement()
  $writer.WriteEndDocument()
} finally {
  $writer.Dispose()
}

Write-Host "sitemap.xml generated with $($htmlFiles.Count) pages."