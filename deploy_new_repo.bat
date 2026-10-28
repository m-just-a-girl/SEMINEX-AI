@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0deploy_new_repo.ps1" %*
