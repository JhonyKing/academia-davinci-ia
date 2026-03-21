@echo off
:: ============================================================
::  Normaliza el audio de todos los videos fuente FAN_*.mp4
::  Usa EBU R128 loudnorm - estandar de TikTok/Instagram (-14 LUFS)
::
::  REQUIERE: FFmpeg instalado y en el PATH
::  Instalar con: winget install Gyan.FFmpeg
:: ============================================================

echo Verificando FFmpeg...
ffmpeg -version >nul 2>&1
if errorlevel 1 (
  echo.
  echo ERROR: FFmpeg no encontrado.
  echo.
  echo Para instalar FFmpeg, abre PowerShell como Administrador y ejecuta:
  echo   winget install Gyan.FFmpeg
  echo.
  echo Luego cierra y vuelve a abrir esta ventana.
  pause
  exit /b 1
)

echo FFmpeg encontrado. Iniciando normalizacion...
echo.

set "SOURCE_DIR=public\hooks_videos"
set "TEMP_FILE=%SOURCE_DIR%\_temp_normalized.mp4"

set COUNT=0
set ERRORS=0

for %%F in ("%SOURCE_DIR%\FAN_*.mp4") do (
  echo Procesando: %%~nxF

  ffmpeg -y -i "%%F" ^
    -af "loudnorm=I=-14:TP=-1.5:LRA=11:linear=true" ^
    -c:v copy ^
    -movflags +faststart ^
    "%TEMP_FILE%" -loglevel warning

  if errorlevel 1 (
    echo   ERROR al procesar %%~nxF
    set /a ERRORS+=1
  ) else (
    move /y "%TEMP_FILE%" "%%F" >nul
    echo   OK - Normalizado
    set /a COUNT+=1
  )
)

echo.
echo ============================================================
echo  Normalizacion completa!
echo  Videos procesados: %COUNT%
if %ERRORS% gtr 0 (
  echo  Errores:           %ERRORS%
)
echo ============================================================
pause
