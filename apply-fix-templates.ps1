# Script d'application automatique du fix templates
# Usage : .\apply-fix-templates.ps1

$file = "database_templates.cjs"

Write-Host "🔧 Application du fix templates..." -ForegroundColor Cyan

# Lire le contenu
$content = Get-Content $file -Raw

# Remplacements
$content = $content -replace "resources/templates/portfolio/free/([^/]+)/thumbnail\.png", "templates/thumbnails/`$1.svg"
$content = $content -replace "resources/templates/portfolio/free/([^/]+)/template\.html", "templates/`$1.html"

# Écrire le fichier modifié
$content | Set-Content $file -NoNewline

Write-Host "✅ Fix appliqué avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes :" -ForegroundColor Yellow
Write-Host "  git add database_templates.cjs"
Write-Host "  git commit -m 'fix: corriger chemins templates'"
Write-Host "  git push"
