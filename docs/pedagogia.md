# Pedagogía — Academia Da Vinci IA

## Filosofía central

Academia Da Vinci IA enseña inteligencia artificial creativa a niños de 8-13 años a través de **misiones narrativas**, **creación de un personaje propio**, y un **sistema de desbloqueo secuencial**. No es un curso de programación — es un curso de _creación con IA_.

El alumno no aprende sobre IA de forma abstracta. La aprende _usándola_ para hacer algo que le importa: su propio personaje animado con historia, mundo, diálogos, música y voz.

---

## Inspiraciones y referencias investigadas

### Fritz & Chesster (caso de éxito principal)

- Juego de ajedrez para niños que convirtió el aprendizaje en una aventura narrativa
- El niño Fritz debe rescatar al Rey del villano Chester
- **Lección clave**: el contenido difícil (ajedrez = táctica abstracta) se vuelve accesible cuando está al servicio de una historia que el niño quiere vivir
- Aplicamos esto: cada herramienta de IA es un "poder" que Robotsin le enseña al alumno para avanzar en su misión creativa

### Genius Hour / Proyecto Pasión

- Metodología usada en escuelas Montessori y Silicon Valley: 20% del tiempo en proyectos propios
- **Lección clave**: los niños aprenden más cuando el producto final es _suyo_ — no del maestro
- Aplicamos esto: el alumno crea SU personaje, SU mundo, SU historia — no un ejemplo genérico

### Duolingo (gamificación de progreso)

- Racha diaria, puntos XP, insignias, niveles
- **Lección clave**: el progreso visible motiva más que las calificaciones
- Aplicamos esto: cada clase desbloquea la siguiente, cada módulo otorga una insignia temática

### Khan Academy / Misiones por nivel

- Prerrequisitos: no puedes ver la siguiente lección hasta completar la anterior
- **Lección clave**: el desbloqueo secuencial crea sensación de logro y evita el síndrome de "saltarse lo importante"
- Aplicamos esto: `auth.js` marca cada clase completa al 90% de scroll → desbloquea la siguiente

### Scratch (MIT) — Creatividad computacional para niños

- Los niños crean proyectos reales (juegos, animaciones) desde el día 1
- **Lección clave**: empezar con el resultado visible (el personaje, la animación) engancha antes de explicar la teoría
- Aplicamos esto: Clase 1 ya produce algo — el alumno ve a su personaje en pantalla antes de entender cómo funciona

### Metodología "Misión" (gamificación narrativa)

Cada clase tiene:

- **Nombre de misión** (no "Clase 7 — Mapa del mundo" sino "Misión: El Cartógrafo del Futuro")
- **Objetivo narrativo** (¿qué necesita Robotsin que tú lo ayudes a hacer?)
- **Actividad creativa central** con nombre épico ("El Laboratorio del Universo", "La Sala de Diálogos")
- **Insignia al completar** (visual, colorida, con nombre del módulo)
- **Tarea** que conecta con la siguiente clase

---

## Estructura pedagógica: 6 módulos × 4 clases

| Módulo                     | Tema                   | Herramientas IA          | Resultado del alumno                |
| -------------------------- | ---------------------- | ------------------------ | ----------------------------------- |
| M1: El Genio Creativo      | Bienvenida + personaje | ChatGPT texto/imagen     | Personaje + tarjeta oficial         |
| M2: El Mundo del Genio     | Worldbuilding          | ChatGPT imagen + mapas   | Universo + aliados + mapa           |
| M3: La Historia del Genio  | Narrativa              | ChatGPT guion + diálogos | Guion + cómic + episodio            |
| M4: El Genio en Movimiento | Animación              | IA animación             | Animaciones + escenas + trailer     |
| M5: La Voz del Genio       | Audio                  | IA música + voz + SFX    | Tema musical + voz + audio completo |
| M6: El Genio al Mundo      | Ensamble final         | Todo integrado           | Proyecto final + graduación         |

---

## Sistema de desbloqueo (Fritz & Chesster aplicado)

1. Alumno entra → `auth.js` verifica sesión Supabase
2. Al llegar al 90% del scroll → `progress.upsert(clase_num, completada: true)`
3. `index.html` muestra clases completadas como ✓ y las siguientes como disponibles
4. Las clases futuras permanecen bloqueadas visualmente hasta que se desbloquean

**Por qué el 90% y no el 100%**: El alumno no debe sentirse castigado si cierra el browser justo antes del final. El 90% asume que leyó lo esencial.

---

## Tono y voz del curso

- **Directo al alumno**: "Tú eres el genio. Robotsin es tu maestro robot."
- **Nunca condescendiente**: los niños de 12 años detectan el tono "para niñitos" y lo rechazan
- **Vocabulario real**: usamos "inteligencia artificial", "prompt", "renderizar" — definidos en contexto, no evitados
- **Misiones épicas**: los nombres de actividades suenan importantes ("El Laboratorio del Universo", "La Sala de Guionistas")
- **Insignias visuales**: cada módulo tiene su color e insignia — refuerzo visual del logro

---

## Qué NO es este curso

- No es un curso de programación (no se escribe código)
- No es un tutorial de herramientas (no se enseña ChatGPT como fin, sino como medio)
- No es un curso pasivo (cada clase termina con algo creado por el alumno)
- No reemplaza la creatividad del niño — la amplifica
