$ErrorActionPreference = "Stop"

Write-Host "Setting up part branches from main..."
git branch -f part/engine main
git push -u origin part/engine

git branch -f part/screens main
git push -u origin part/screens

git branch -f part/team main
git push -u origin part/team

git branch -f part/data main
git push -u origin part/data

git checkout main
Write-Host "Part branches setup and pushed successfully."
