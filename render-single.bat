@echo off
:: Uso: render-single.bat FAN-ANDRES-CALAMARO
:: Si no pasas argumento, te pide que elijas

if "%1"=="" (
  echo Uso: render-single.bat ^<ID-COMPOSICION^>
  echo.
  echo IDs disponibles:
  echo   FAN-ANDRES-CALAMARO
  echo   FAN-CAIFANES
  echo   FAN-CHARLY-GARCIA
  echo   FAN-FOO-FIGHTERS
  echo   FAN-GREEN-DAY
  echo   FAN-JOSE-MADERO
  echo   FAN-JUANES
  echo   FAN-JUAN-SOLO
  echo   FAN-LA-LEY
  echo   FAN-LENNY-KRAVITZ
  echo   FAN-LOS-BUNKERS
  echo   FAN-MANA
  echo   FAN-MUSE
  echo   FAN-PANDA
  echo   FAN-PLASTILINA-MOSH
  echo   FAN-RIO-ROMA
  echo   FAN-SANTIAGO-CRUZ
  echo   FAN-SOBER
  echo   FAN-SODA-STEREO
  echo   FAN-VIVA-SUECIA
  echo   FAN-ZOE
  goto end
)

if not exist "out\hooks" mkdir "out\hooks"

echo Renderizando: %1
npx remotion render %1 "out/hooks/%1.mp4"

:end
pause
