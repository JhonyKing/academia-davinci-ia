# Integración de ElevenLabs TTS

Este proyecto incluye integración con ElevenLabs Text-to-Speech para generar audio de alta calidad.

## Configuración

1. **Instalar dependencias** (ya está hecho):
   ```bash
   npm install @elevenlabs/elevenlabs-js dotenv
   ```

2. **Configurar API Key:**
   - Copia `.env.example` a `.env`
   - Agrega tu API key de ElevenLabs:
     ```
     ELEVENLABS_API_KEY=tu_api_key_aquí
     ```
   - **IMPORTANTE:** El archivo `.env` NO se commitea a git

## Uso Rápido

### Generar Audio

```bash
node scripts/eleven_tts.mjs --text "Hola, esto es Loomin Lab" --voice "pNInz6obpgDQGcFmaJgB" --out "public/audio/intro.mp3"
```

### Parámetros

- `--text`: Texto a convertir en audio
- `--voice`: ID de voz de ElevenLabs (obtén IDs en https://elevenlabs.io/app/voices)
- `--out`: Ruta de salida (debe estar en `public/`)

### Usar en Remotion

```typescript
import {Audio, staticFile} from 'remotion';

<Audio src={staticFile('audio/intro.mp3')} volume={0.8} />
```

## Voces Recomendadas

- `pNInz6obpgDQGcFmaJgB` - Adam (masculina, español)
- `21m00Tcm4TlvDq8ikWAM` - Rachel (femenina, español)
- `nPczCjzI2devNBz1zQrb` - Brian (masculina, joven)

## Documentación Completa

Ver `.agent/skills/elevenlabs-tts/SKILL.md` para:
- Ejemplos completos
- Flujos de trabajo
- Solución de problemas
- Mejores prácticas

## Estructura de Archivos

```
JhonyKingAI_Remotion/
├── .env                      # Tu API key (NO commitear)
├── .env.example              # Template de ejemplo
├── scripts/
│   └── eleven_tts.mjs       # Script de generación
└── public/
    └── audio/                # Archivos de audio generados
        ├── intro.mp3
        ├── narration.mp3
        └── outro.mp3
```

## Seguridad

⚠️ **IMPORTANTE:**
- El archivo `.env` ya está en `.gitignore`
- NUNCA commitees tu API key
- Si accidentalmente la expones, regenerala en https://elevenlabs.io/app/settings/api-keys
