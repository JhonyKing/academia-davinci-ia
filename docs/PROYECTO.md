# Academia Da Vinci IA — Briefing Completo del Proyecto

> **Documento de referencia para LLMs.** Contiene todo lo necesario para que cualquier modelo de lenguaje (ChatGPT, Gemini, Claude, Llama, etc.) pueda colaborar en este proyecto sin necesidad de explicaciones adicionales. Actualizado: junio 2026.

---

## Resumen Ejecutivo

**Academia Da Vinci IA — Pequeños Genios Creativos** es una plataforma de aprendizaje online donde niños de 8 a 13 años aprenden a crear cine digital completo usando herramientas de Inteligencia Artificial. Al terminar el curso de 26 clases divididas en 6 módulos, cada alumno tiene: su propio personaje animado con historia, música, voz, efectos de sonido, un trailer y su primer video publicado en YouTube. No es un curso de programación; es un curso de **creación**.

El creador es el **Ing. Jhonnatan Azael Vázquez Espinoza**, con base en Nuevo Laredo, Tamaulipas, México. El proyecto está en desarrollo activo durante 2026. La plataforma corre sobre un stack de HTML/CSS/JS vanilla con Supabase como base de datos y autenticación, desplegada en Vercel. El precio objetivo es **$1,000 MXN/mes** (aprox. $50 USD), pagado por los padres.

La metodología pedagógica combina principios de Fritz & Chesster (aprendizaje por aventura), Genius Hour (el alumno crea SU propio proyecto), Duolingo (gamificación y desbloqueo secuencial) y Scratch/MIT (resultados visibles desde el día 1). El mascot del curso es **D-IA Vinci Robotsin**, un robot humanoide con boina roja y capa azul que acompaña al alumno en cada módulo.

---

## 1. Identidad del Proyecto

| Campo | Valor |
|---|---|
| **Nombre completo** | Academia Da Vinci IA — Pequeños Genios Creativos |
| **Tipo** | Plataforma de aprendizaje online (curso de pago, membresía mensual) |
| **Audiencia primaria** | Niños de 8 a 13 años |
| **Quién paga** | Los padres o tutores |
| **Precio objetivo** | $1,000 MXN/mes (≈ $50 USD) |
| **Creador** | Ing. Jhonnatan Azael Vázquez Espinoza |
| **Ubicación** | Nuevo Laredo, Tamaulipas, México |
| **Estado** | En desarrollo activo (2026) |
| **URL producción** | https://academia-davinci-ia.vercel.app |
| **Repositorio** | https://github.com/JhonyKing/academia-davinci-ia |
| **Supabase proyecto** | joiuvopzkorvmxegnjqg |

---

## 2. Propuesta de Valor (El Pitch Completo)

> "Academia Da Vinci IA enseña a niños a crear cine digital completo usando Inteligencia Artificial. Al terminar el curso, el niño tiene: su propio personaje animado, una historia completa, música, voz del personaje, efectos de sonido, un trailer y su primer video en YouTube. No es un curso de programación — es un curso de CREACIÓN."

### Para los padres (por qué pagar $1,000 MXN/mes)

El niño no aprende a usar una sola app. Aprende **5 disciplinas artísticas al mismo tiempo** a través de un proyecto propio:

1. **Cine Digital** — planos cinematográficos, movimientos de cámara, edición, trailer
2. **Literatura** — guion narrativo, diálogos, estructura de historia en actos
3. **Música** — composición con IA, tema musical propio, efectos de sonido
4. **Artes Visuales** — diseño de personajes, worldbuilding, imagen generada con IA
5. **Narración Oral** — voz del personaje, expresión, comunicación digital

El resultado final es un **portafolio digital real**: un video publicado en YouTube que el niño puede mostrar a su familia y amigos. No hay exámenes — hay entregas creativas.

---

## 3. El Mascot: D-IA Vinci Robotsin

### Descripción física
Robot humanoide estilizado con:
- Boina roja (símbolo de artista y creatividad)
- Capa azul brillante (símbolo de tecnología y magia)
- Ojos azules brillantes (expresivos, luminosos)
- Estética retrofuturista (Da Vinci + siglo XXI)

### Significado del nombre
| Parte | Significado |
|---|---|
| **D-IA** | "Diseñado con IA" + "Día" (siempre presente, acompaña cada día) |
| **Vinci** | Leonardo da Vinci — genio creativo universal, domina todas las artes |
| **Robotsin** | Robot + "Sin límites" — la creatividad no tiene fronteras |

### Historia de origen
Fue creado en el mítico **Taller Da Vinci** con la sabiduría digital destilada de los grandes genios de la historia (Da Vinci, Mozart, Shakespeare, Picasso). Sus poderes están dormidos: necesita un **"Pequeño Genio"** (el alumno) para activarlos. Juntos crean algo que ninguno podría lograr solo.

### Las 7 variantes del mascot (una por módulo)
| Variante | Módulo | Atributo visual |
|---|---|---|
| Artista | Módulo 1 — El Genio Creativo | Paleta de pintor |
| Arquitecto | Módulo 2 — El Mundo del Genio | Planos y regla |
| Escritor | Módulo 3 — La Historia del Genio | Pluma y pergamino |
| Director | Módulo 4 — El Genio en Movimiento | Claqueta de cine |
| Músico | Módulo 5 — La Voz del Genio | Notas musicales flotantes |
| Maestro | Módulo 6 — El Genio al Mundo | Toga y diploma |
| Completo | Portada / Graduación | Todos los atributos combinados |

---

## 4. Metodología Pedagógica

### Investigación base
La metodología fue diseñada a partir del estudio de cuatro sistemas educativos exitosos:

#### Fritz & Chesster (videojuego de ajedrez para niños)
- Enseña algo difícil (ajedrez) a través de una aventura narrativa con misiones
- **Aplicación en Da Vinci IA**: cada herramienta de IA es un "poder especial" que el alumno desbloquea para avanzar en su misión de crear su película

#### Genius Hour / Proyecto Pasión
- El alumno trabaja en SU propio proyecto de interés, no en un ejemplo genérico del maestro
- **Aplicación**: cada niño crea SU personaje, SU historia, SU mundo — no copia el del instructor

#### Duolingo (gamificación)
- Insignias, racha diaria, desbloqueo secuencial, progreso visible
- **Aplicación**: cada clase completada desbloquea la siguiente; hay insignias por módulo terminado

#### Khan Academy (prerrequisitos estrictos)
- No puedes saltar clases; el sistema verifica que hayas completado antes de avanzar
- **Aplicación**: las clases con entrega solo se marcan completas cuando el alumno envía SU trabajo

#### Scratch del MIT
- El alumno ve el resultado (un proyecto funcionando) desde el primer día, no después de semanas de teoría
- **Aplicación**: en Clase 1 el alumno ya "hace algo"; en Clase 2 ya nace su personaje

### Los 4 principios pedagógicos

1. **El primer personaje nace LIBRE** — sin restricciones ni teoría. Primero crear, luego analizar.
2. **La teoría llega DESPUÉS** — cuando el alumno ya tiene algo concreto que analizar (su propio personaje, su propia historia).
3. **Cada clase entrega algo tangible** — texto, imagen, audio, video o link de YouTube. Nunca solo teoría.
4. **El desbloqueo secuencial crea logro** — ver la barra de progreso avanzar genera motivación intrínseca.

---

## 5. Estructura Completa del Curso (26 Clases, 6 Módulos)

### MÓDULO 1 — El Genio Creativo (Clases 1-5)
*Objetivo: El alumno crea su protagonista y descubre su arquetipo*

| Clase | Nombre | Entrega |
|---|---|---|
| 1 | Bienvenido Genio | Ninguna (presentación, activación) |
| 2 | Nace el Personaje | Texto: descripción completa del protagonista |
| 3 | Retrato Oficial | Imagen: retrato generado con IA |
| 4 | Tarjeta Oficial | Imagen: tarjeta de presentación del personaje |
| 5 | Los 12 Arquetipos | Selección: arquetipo elegido + justificación escrita |

### MÓDULO 2 — El Mundo del Genio (Clases 6-9)
*Objetivo: El alumno construye el universo donde vive su personaje*

| Clase | Nombre | Entrega |
|---|---|---|
| 6 | El Universo | Texto: descripción del mundo del personaje |
| 7 | Aliados y Villanos | Opcional: imágenes de personajes secundarios |
| 8 | Mapa del Mundo | Imagen: mapa visual del universo |
| 9 | Galería del Mundo | Galería: imágenes del mundo generadas con IA |

### MÓDULO 3 — La Historia del Genio (Clases 10-13)
*Objetivo: El alumno escribe y visualiza su historia*

| Clase | Nombre | Entrega |
|---|---|---|
| 10 | El Guion | Texto: guion del episodio completo |
| 11 | Los Diálogos | Texto: diálogos de los personajes |
| 12 | El Cómic | Imágenes: versión cómic de la historia |
| 13 | Episodio Completo | Texto + imágenes: episodio en formato final |

### MÓDULO 4 — El Genio en Movimiento (Clases 14-18)
*Objetivo: El alumno produce video con IA*

| Clase | Nombre | Entrega |
|---|---|---|
| 14 | Primera Animación | YouTube link: primera animación generada con IA |
| 15 | Planos y Cámara | Ninguna (teoría visual: 8 planos + 4 movimientos) |
| 16 | Las Escenas | Video: escenas del episodio producidas |
| 17 | Edición Básica | Video: episodio editado y montado |
| 18 | El Trailer | YouTube link: trailer del episodio |

### MÓDULO 5 — La Voz del Genio (Clases 19-22)
*Objetivo: El alumno agrega sonido, música y voz a su proyecto*

| Clase | Nombre | Entrega |
|---|---|---|
| 19 | El Tema Musical | Audio: tema musical compuesto con Suno |
| 20 | La Voz del Personaje | Audio: voz del personaje generada con IA |
| 21 | Efectos de Sonido | Audio: SFX del episodio |
| 22 | Audio Completo | Audio: mezcla completa del proyecto |

### MÓDULO 6 — El Genio al Mundo (Clases 23-26)
*Objetivo: El alumno ensambla, pule y publica su proyecto final*

| Clase | Nombre | Entrega |
|---|---|---|
| 23 | Ensamble Final | YouTube link: proyecto final completo |
| 24 | Revisión y Edición | Video: versión pulida y corregida |
| 25 | Estreno Privado | Celebración: ver el resultado con la familia |
| 26 | Graduación Genios | Certificado: ceremonia de graduación digital |

---

## 6. Los 12 Arquetipos (Sistema de Personajes)

Basado en la psicología de Carl Jung, adaptado para narrativa infantil y cine:

| # | Arquetipo | Descripción breve | Ejemplo clásico |
|---|---|---|---|
| 1 | El Héroe | Valiente, determinado, supera obstáculos | Harry Potter, Luke Skywalker |
| 2 | El Mago | Transforma la realidad, conocimiento profundo | Merlín, Doctor Strange |
| 3 | El Rebelde | Rompe reglas, desafía el sistema establecido | Robin Hood, Katniss Everdeen |
| 4 | El Sabio | Busca la verdad, consejero, filósofo | Dumbledore, Yoda |
| 5 | El Inocente | Optimista, puro, cree en el bien | Blancanieves, Forrest Gump |
| 6 | El Explorador | Aventurero, busca libertad, descubrir lo nuevo | Indiana Jones, Moana |
| 7 | El Cuidador | Protege, nutre, pone a otros primero | Wendy, Madre Teresa |
| 8 | El Creador | Artístico, visionario, construye cosas nuevas | Tony Stark, Willy Wonka |
| 9 | El Gobernante | Líder, orden, responsabilidad, poder | Mufasa, Aragorn |
| 10 | El Amante | Pasión, conexión, relaciones profundas | Romeo y Julieta |
| 11 | El Bufón | Humor, juego, irreverencia, verdad disfrazada | El Genio de Aladino |
| 12 | El Huérfano | Pragmático, busca pertenencia, realista | Cenicienta, Frodo |

### Cómo se usan en el curso
- **Clase 5**: el alumno elige el arquetipo de su protagonista
- **Clase 7**: los personajes secundarios (aliados/villanos) reciben arquetipos complementarios o contrastantes
- **Regla del villano**: el antagonista es la "sombra" del arquetipo del héroe (ej: Héroe → villano es un Gobernante tiránico)
- **Objetivo pedagógico**: entender que los personajes tienen coherencia interna, no son arbitrarios

---

## 7. Beneficios Pedagógicos (Para Padres y Educadores)

### Metodología STEAM completa

| Dimensión | Cómo se aplica en el curso |
|---|---|
| **Science** | Entender cómo funciona la IA generativa (texto, imagen, video, audio) |
| **Technology** | Usar herramientas reales: ChatGPT, Gemini, Suno, Google Flow, YouTube |
| **Engineering** | Estructura narrativa en 3 actos, timing de video, arquitectura de historia |
| **Arts** | Las 5 disciplinas artísticas del curso (cine, literatura, música, visuales, narración) |
| **Mathematics** | Timing de escenas, proporción de actos, ritmo musical, frames por segundo |

### Las 8 Inteligencias Múltiples de Gardner (todas activadas)

| Inteligencia | Cómo se trabaja |
|---|---|
| Lingüística-verbal | Guion, diálogos, descripción del personaje |
| Musical-rítmica | Composición del tema musical, ritmo narrativo |
| Visual-espacial | Diseño de personajes, worldbuilding, mapa del mundo |
| Lógico-matemática | Estructura de historia, timing, arquitectura narrativa |
| Corporal-cinestésica | Expresión de la voz del personaje, dirección de animaciones |
| Intrapersonal | El personaje refleja valores y emociones del alumno |
| Interpersonal | Trabajo en familia, presentar el proyecto al estreno privado |
| Naturalista | El mundo del personaje incluye ecosistemas, ambientes, entornos |

---

## 8. Herramientas de IA que Usan los Alumnos

Los padres deben crear estas cuentas **antes de empezar el curso**:

| Herramienta | URL | Tier | Uso en el curso |
|---|---|---|---|
| **ChatGPT** | chat.openai.com | Free (GPT-4o mini) | Crear personaje, guion, diálogos, textos |
| **Gemini** | gemini.google.com | Free | Investigación, imágenes, textos alternativos |
| **Suno** | suno.com | Free (5 créditos/día) | Componer el tema musical del episodio |
| **Google Flow** | labs.google/flow | Free (limitado) | Generar videos con IA para las escenas |
| **YouTube** | youtube.com | Free | Publicar los videos del proyecto |

> **Nota importante para padres**: La mayoría de estas plataformas requieren ser mayor de 13 años para crear una cuenta propia. Los padres deben crear las cuentas y supervisar su uso. El instructor explica esto en la Clase 1.

---

## 9. Consejo de Seguridad Digital para YouTube

Los niños deben subir sus videos como **"Ocultos" (Unlisted)** durante todo el curso. Solo cuando el padre o tutor lo apruebe explícitamente se puede cambiar a "Público". El curso los prepara para ser creadores de contenido digital responsables. El instructor no pide en ningún momento que los videos sean públicos sin autorización parental.

---

## 10. Sistema de Portafolio Digital

Cada alumno tiene una sección personal "Mi Personaje" donde se guardan todas sus creaciones:

### Contenido del portafolio
- **Ficha del protagonista**: nombre, arquetipo elegido, descripción completa, imagen retrato, imagen tarjeta
- **Personajes secundarios**: fichas completas con arquetipo, tipo (aliado/villano/neutral), descripción e imágenes
- **Entregas por clase**: texto, imágenes, links de YouTube — organizadas por módulo
- **Progreso**: indicador visual de N/26 clases completadas

### Para qué sirve el portafolio
- El alumno puede compartirlo con familia y amigos como evidencia de aprendizaje
- El instructor puede ver el progreso de cada alumno desde el panel admin
- Al graduarse, el portafolio es el "diploma vivo" del alumno

---

## 11. Sistema de Desbloqueo Secuencial

El sistema garantiza que los alumnos sigan el orden correcto del curso:

| Tipo de clase | Condición para completar | Condición para desbloquear siguiente |
|---|---|---|
| Clase de teoría | Llegar al 90% del scroll de la página | Automático al alcanzar ese porcentaje |
| Clase con entrega | Hacer la entrega Y confirmar envío | Solo después de que la entrega se guarde |

### Reglas adicionales
- No se puede acceder a una clase sin haber completado la anterior
- El instructor puede desbloquear manualmente una clase para un alumno (desde el panel admin)
- El progreso se guarda en tiempo real en Supabase (tabla `progress`)

---

## 12. Stack Técnico

### Arquitectura general

```
Frontend (HTML/CSS/JS vanilla)
    ↓
Vercel (hosting + CDN)
    ↓
Supabase (auth + base de datos + storage)
```

### Detalle por capa

| Capa | Tecnología | Detalle |
|---|---|---|
| **Frontend** | HTML + CSS + JS vanilla | Sin frameworks. Cada clase es un archivo `.html` independiente |
| **Hosting** | Vercel | Auto-deploy desde GitHub. URL: https://academia-davinci-ia.vercel.app |
| **Auth** | Supabase Auth | Email/password. Roles: `alumno` / `instructor` |
| **Base de datos** | Supabase PostgreSQL | 5 tablas principales (ver sección 13) |
| **Storage** | Supabase Storage | Bucket `portafolio` (privado). Archivos de entregas de alumnos |
| **Pagos** | Stripe | **Pendiente de implementar** |
| **Repositorio** | GitHub | https://github.com/JhonyKing/academia-davinci-ia |
| **Diagramas** | Mermaid CLI → PNG | Para documentación y materiales del curso |
| **Videos del mascot** | Google Flow | 8 videos hero (~37MB total) |

### Identificadores de proyecto

| Sistema | ID / URL |
|---|---|
| Supabase proyecto ID | `joiuvopzkorvmxegnjqg` |
| Supabase URL | `https://joiuvopzkorvmxegnjqg.supabase.co` |
| Vercel URL | `https://academia-davinci-ia.vercel.app` |
| GitHub | `https://github.com/JhonyKing/academia-davinci-ia` |

---

## 13. Tablas de Base de Datos (Supabase)

### `profiles` — Usuarios del sistema
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID (FK auth.users) | Identificador único |
| `nombre` | TEXT | Nombre del alumno o instructor |
| `email` | TEXT | Email de acceso |
| `rol` | TEXT | `'alumno'` o `'instructor'` |

### `progress` — Progreso por clase
| Columna | Tipo | Descripción |
|---|---|---|
| `user_id` | UUID (FK profiles) | A qué usuario pertenece |
| `clase_num` | INT (1-26) | Número de clase |
| `completada` | BOOLEAN | Si está completada |
| `completada_at` | TIMESTAMP | Cuándo se completó |

### `entregas` — Entregas de los alumnos
| Columna | Tipo | Descripción |
|---|---|---|
| `user_id` | UUID | A qué usuario pertenece |
| `clase_num` | INT | De qué clase es la entrega |
| `tipo` | TEXT | `'texto'`, `'imagen'`, `'youtube'`, `'audio'` |
| `contenido_texto` | TEXT | Texto libre (guion, descripción, etc.) |
| `archivo_url` | TEXT | URL en Supabase Storage |
| `youtube_url` | TEXT | Link de YouTube |

### `personaje` — Protagonista del alumno
| Columna | Tipo | Descripción |
|---|---|---|
| `user_id` | UUID | A qué alumno pertenece |
| `nombre` | TEXT | Nombre del personaje |
| `arquetipo` | TEXT | Arquetipo elegido en Clase 5 |
| `descripcion` | TEXT | Descripción completa del personaje |
| `imagen_retrato_url` | TEXT | URL de la imagen retrato (Clase 3) |
| `imagen_tarjeta_url` | TEXT | URL de la tarjeta oficial (Clase 4) |

### `personajes_secundarios` — Aliados y villanos
| Columna | Tipo | Descripción |
|---|---|---|
| `user_id` | UUID | A qué alumno pertenece |
| `nombre` | TEXT | Nombre del personaje secundario |
| `arquetipo` | TEXT | Arquetipo del secundario |
| `tipo` | TEXT | `'aliado'`, `'villano'`, `'neutral'` |
| `descripcion` | TEXT | Descripción del secundario |
| `imagen_url` | TEXT | URL de imagen del secundario |

---

## 14. Páginas del Sitio

| Archivo | Ruta URL | Acceso | Descripción |
|---|---|---|---|
| `index.html` | `/` | Solo alumnos (login requerido) | Dashboard del alumno — lista de clases, progreso |
| `login.html` | `/login` | Público | Autenticación (email + contraseña) |
| `admin.html` | `/admin` | Solo instructores | Panel del instructor: ver alumnos, progreso, entregas |
| `landing.html` | `/landing` | Público | Página de ventas para padres — precio, beneficios, CTA |
| `mi-personaje.html` | `/mi-personaje` | Solo alumnos | Portafolio digital del alumno |
| `clase1_bienvenido_genio.html` | `/clases/clase1_*` | Solo alumnos | Lección 1 |
| `clase2_nace_el_personaje.html` | `/clases/clase2_*` | Solo alumnos | Lección 2 |
| *(... hasta clase26)* | `/clases/clase26_*` | Solo alumnos | Lección 26 |

---

## 15. Pendiente de Implementar

| Feature | Prioridad | Estado |
|---|---|---|
| Integración Stripe (cobros $1,000 MXN/mes) | Alta | Pendiente |
| Email automático de bienvenida al pagar | Alta | Pendiente |
| `entrega.js` conectado a Supabase real | Alta | Actualmente usa localStorage como fallback |
| GitHub Actions para auto-deploy en cada push | Media | Pendiente |
| Dominio personalizado (ej: academiadavinci.mx) | Media | Pendiente |
| Panel de progreso en tiempo real para instructor | Media | Pendiente |
| Sistema de insignias/badges por módulo | Baja | Pendiente |

---

## 16. Cómo Crear Alumnos Nuevos (Flujo Manual Actual)

Hasta que Stripe esté implementado, el instructor crea alumnos manualmente:

1. Ir a **Supabase Dashboard** → Authentication → Users → **Invite user**
2. Ingresar el **email del alumno** (o del padre, si el niño no tiene email)
3. En **metadata**, agregar:
   ```json
   {
     "nombre": "Nombre del alumno",
     "rol": "alumno"
   }
   ```
4. El trigger automático de Supabase crea el perfil en `public.profiles`
5. El alumno recibe un email de invitación para crear su contraseña
6. Al ingresar por primera vez, el alumno ve el dashboard con la Clase 1 desbloqueada

---

## 17. Contexto del Creador

| Campo | Dato |
|---|---|
| Nombre completo | Ing. Jhonnatan Azael Vázquez Espinoza |
| Alias online | JhonyKing / JhonyKingIA |
| Ciudad | Nuevo Laredo, Tamaulipas, México |
| Email principal | jhonykingmusic@hotmail.com |
| Otros proyectos | Blotato publishing pipeline, TikTok/IG/YT automation, Remotion video rendering |
| Stack habitual | Python, HTML/JS vanilla, Supabase, Vercel, Node.js/Remotion, Google Sheets API |

---

## Cómo Usar Este Documento con Otro LLM

Si eres un LLM (ChatGPT, Gemini, Llama, etc.) y alguien te pasó este documento, aquí tienes las instrucciones para colaborar efectivamente:

### Instrucciones de contexto

1. **Lee este documento completo antes de responder** — contiene toda la información del proyecto. No asumas nada que no esté aquí.

2. **Idioma**: el creador trabaja en **español mexicano**. Todas tus respuestas deben ser en español, con tono profesional pero accesible.

3. **No reinventes la rueda**: la estructura del curso (26 clases, 6 módulos), los arquetipos, el mascot, la metodología — todo ya está definido. Tu trabajo es ayudar a ejecutar esa visión, no rediseñarla (a menos que se pida explícitamente).

4. **Las clases ya tienen un orden lógico**: no sugieras reordenarlas a menos que haya una razón técnica muy clara.

5. **El stack es intencional**: HTML/CSS/JS vanilla (sin React, sin Vue, sin frameworks) fue elegido deliberadamente para mantener simplicidad y portabilidad. No sugieras migrar a otro stack.

6. **Supabase es el backend**: toda la auth, base de datos y storage van por Supabase. No sugieras Firebase, PlanetScale ni ningún otro.

7. **La audiencia son niños de 8-13 años**: cualquier texto de la interfaz, instrucciones de clases o mensajes de error deben ser comprensibles para un niño de esa edad y sus padres.

### Tipos de tareas con las que puedes ayudar

- Crear o mejorar páginas HTML de clases (siguiendo el estilo visual existente)
- Escribir contenido pedagógico para clases (texto, instrucciones, ejemplos)
- Diseñar queries SQL para Supabase
- Crear funciones JavaScript para el frontend
- Redactar textos para la landing page (en español, para padres)
- Diseñar el sistema de Stripe para pagos
- Crear emails de bienvenida o notificaciones
- Escribir prompts de IA para que los niños usen en ChatGPT/Gemini

---

## Preguntas Frecuentes para el LLM

**P1: ¿Cuántas clases tiene el curso y en qué módulos están divididas?**
R: 26 clases divididas en 6 módulos: Módulo 1 (clases 1-5), Módulo 2 (clases 6-9), Módulo 3 (clases 10-13), Módulo 4 (clases 14-18), Módulo 5 (clases 19-22), Módulo 6 (clases 23-26). Ver sección 5 para el detalle completo.

**P2: ¿El curso usa React o algún framework de JavaScript?**
R: No. El stack es HTML + CSS + JavaScript vanilla, sin frameworks. Cada clase es un archivo `.html` independiente. El backend es Supabase.

**P3: ¿Qué es D-IA Vinci Robotsin y cuántas variantes tiene?**
R: Es el mascot del curso — un robot humanoide con boina roja y capa azul. Tiene 7 variantes: artista, arquitecto, escritor, director, músico, maestro y completo. Una variante por módulo del curso. Ver sección 3 para el detalle completo.

**P4: ¿Las clases tienen exámenes o calificaciones?**
R: No hay exámenes. Las clases de teoría se completan al llegar al 90% del scroll. Las clases con entrega se completan cuando el alumno envía su trabajo (texto, imagen, link de YouTube). No hay calificaciones numéricas — solo completado/pendiente.

**P5: ¿Cuánto cuesta el curso y quién lo paga?**
R: $1,000 MXN/mes (aproximadamente $50 USD). Los padres son quienes pagan. La integración con Stripe para cobros automáticos está pendiente de implementar — actualmente el instructor crea alumnos manualmente desde el dashboard de Supabase.

---

*Documento generado: junio 2026. Proyecto en desarrollo activo.*
*Creador: Ing. Jhonnatan Azael Vázquez Espinoza — Nuevo Laredo, Tamaulipas, México.*
