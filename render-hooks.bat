@echo off
echo =============================================
echo  Renderizando Hook Videos - Todos los artistas
echo =============================================

if not exist "out\hooks" mkdir "out\hooks"

set COMPOSITIONS=FAN-ANDRES-CALAMARO FAN-CAIFANES FAN-CHARLY-GARCIA FAN-FOO-FIGHTERS FAN-GREEN-DAY FAN-JOSE-MADERO FAN-JUANES FAN-JUAN-SOLO FAN-LA-LEY FAN-LENNY-KRAVITZ FAN-LOS-BUNKERS FAN-MANA FAN-MUSE FAN-PANDA FAN-PLASTILINA-MOSH FAN-RIO-ROMA FAN-SANTIAGO-CRUZ FAN-SOBER FAN-SODA-STEREO FAN-VIVA-SUECIA FAN-ZOE

for %%C in (%COMPOSITIONS%) do (
  echo.
  echo [%%C] Renderizando...
  npx remotion render %%C "out/hooks/%%C.mp4" --log=verbose
  if errorlevel 1 (
    echo [%%C] ERROR - continua con el siguiente...
  ) else (
    echo [%%C] Listo!
  )
)

echo.
echo =============================================
echo  Todos los videos completados!
echo  Carpeta de salida: out\hooks\
echo =============================================
pause
