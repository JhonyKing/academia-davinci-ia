# D-IA Vinci Robotsin — El Personaje

## Nombre completo
**D-IA Vinci Robotsin**
- "D-IA" = Diseñado con Inteligencia Artificial (guiño a "DIA" como "día" — siempre presente)
- "Vinci" = Leonardo da Vinci, el genio creativo universal
- "Robotsin" = Robot + Sin (sin límites) — el robot que no tiene fronteras creativas

## Descripción visual
- Robot humanoide de tamaño mediano (~1.5m)
- **Boina roja** inclinada — símbolo del artista francés / bohemio creativo
- **Capa azul** con detalles dorados — el héroe que guía
- **Ojos azules brillantes** — tecnología + sabiduría
- **Paleta de colores**: rojo (#E74C3C) + azul (#4A90D9) + dorado (#F39C12)
- Expresión amigable, curiosa, nunca intimidante

## 7 variantes de Robotsin (una por módulo + completo)

| Archivo | Variante | Módulo | Qué porta |
|---------|----------|--------|-----------|
| `robotsin_completo.png` | Todas las herramientas | Index/Bienvenida | Paleta + pluma + partitura + claqueta + todo |
| `robotsin_artista.png` | Artista | M1 — El Genio Creativo | Paleta de pintor |
| `robotsin_arquitecto.png` | Arquitecto | M2 — El Mundo del Genio | Regla + compás |
| `robotsin_escritor.png` | Escritor | M3 — La Historia del Genio | Pluma + pergamino |
| `robotsin_director.png` | Director | M4 — El Genio en Movimiento | Claqueta de cine |
| `robotsin_musico.png` | Músico | M5 — La Voz del Genio | Partitura + nota musical |
| `robotsin_maestro.png` | Maestro | M6 — El Genio al Mundo | Birrete de graduación |

## Ubicación de archivos
- **PNGs (con fondo transparente)**: `clases/robotsin/*.png`
- **Videos hero (fondo animado)**: `clases/robotsin/videos/*.mp4`
- **Originales ChatGPT**: `robotsin/ChatGPT Image*.png` (no usar directamente, fondo blanco)
- **Script de remoción de fondo**: `robotsin/remove_bg.py` (PIL + numpy flood-fill, tolerance=40)

## Videos hero de fondo (8 videos, ~37MB total)
Generados con Google Flow. Se usan como fondo animado en el `<video autoplay loop muted playsinline>` de cada lección.

| Video | Descripción | Usado en |
|-------|-------------|---------|
| `Robot_floating_in_cosmic_space_*.mp4` | Robotsin flotando en el cosmos | index.html, varias clases |
| `Robot_conducting_STEAM_elements_*.mp4` | Robotsin dirigiendo elementos STEAM | Clases de ciencia/arte |
| `Robot_floats_in_cosmic_space_*.mp4` | Vista cósmica alternativa | Variante del hero |
| `Robot_touches_star_explodes_*.mp4` | Robotsin toca estrella, explosión | Clases de clímax |

## Cómo se usa Robotsin en las lecciones

### 1. Hero de fondo (video)
```html
<div class="hero">
  <video class="hero-video" autoplay loop muted playsinline>
    <source src="robotsin/videos/Robot_floating_in_cosmic_space_202606010114.mp4" type="video/mp4">
    <source src="robotsin/videos/Robot_floats_in_cosmic_space_202606010118.mp4" type="video/mp4">
  </video>
  <div class="hero-overlay"></div>
  <div class="hero-content">...</div>
</div>
```

### 2. Robotsin inline (dentro de la lección)
```html
<div class="robotsin-message">
  <img src="robotsin/robotsin_artista.png" alt="Robotsin Artista" class="robotsin-inline">
  <div class="robotsin-bubble">
    <p>💡 <strong>Robotsin dice:</strong> [mensaje pedagogico]</p>
  </div>
</div>
```

### 3. En el index (tarjetas del módulo)
```html
<div class="robotsin-card">
  <img src="robotsin/robotsin_artista.png" class="robotsin-img" alt="Módulo 1">
  <h3>Módulo 1</h3>
  <p>El Genio Creativo</p>
</div>
```

## Historia narrativa de Robotsin (para usar en clases)
Robotsin fue creado en el Taller Da Vinci — un laboratorio secreto donde los genios más grandes de la historia dejaron su sabiduría digital. Leonardo da Vinci, Mozart, Marie Curie, Frida Kahlo — todos dejaron un fragmento de su genio en Robotsin.

Pero Robotsin no puede crear solo. Necesita un *Pequeño Genio* — un niño con imaginación — para que sus poderes funcionen. Juntos, alumno y Robotsin pueden crear mundos, historias, música y personajes que nunca han existido antes.

**Frase de Robotsin en cada módulo**: "Juntos somos el genio más poderoso del universo."
