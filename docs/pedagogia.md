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

## Taxonomía de Bloom aplicada

Benjamin Bloom (1956, revisada por Anderson 2001) identificó 6 niveles cognitivos en orden de complejidad:

**Recordar → Entender → Aplicar → Analizar → Evaluar → Crear**

La educación tradicional opera en los primeros tres niveles. Este curso opera en el nivel más alto — **Crear** — desde la Clase 1. El alumno no recuerda datos sobre IA ni entiende cómo funciona en abstracto: la usa para producir algo que antes no existía.

**Por qué importa como argumento de venta**: La mayoría de cursos para niños están en "Recordar" (memorizar tablas, repetir hechos). Decirle a un padre que su hijo opera en el nivel más alto de la Taxonomía de Bloom desde el día 1 es un diferenciador brutal.

**Aplicado al curso**:
- Clase 1: El alumno ya crea (su primer personaje) — nivel Crear
- Clases 2-4: Crea con más capas (retrato, tarjeta, tarjeta oficial) — nivel Crear
- Módulo 4: Analiza cómo funciona el cine (planos, movimientos) para Crear mejor — niveles Analizar + Crear
- Módulo 6: Evalúa su propio proyecto y lo presenta — niveles Evaluar + Crear

---

## Mentalidad de Crecimiento (Carol Dweck, Stanford)

Dweck demostró que los niños tienen una de dos mentalidades sobre su inteligencia:
- **Mentalidad fija**: "Soy inteligente" o "no soy inteligente" — el talento es innato
- **Mentalidad de crecimiento**: "Puedo aprender esto con esfuerzo" — la habilidad se construye

**La mentalidad fija es el enemigo del aprendizaje creativo**: un niño que cree que "no es bueno para el dibujo" no intentará ilustrar a su personaje. Un niño con mentalidad de crecimiento intenta, falla, ajusta.

**Cómo lo aplica este curso**:
- Robotsin nunca dice "eres talentoso" — dice "lo lograste", "eso que creaste no existía antes"
- El nombre "Genio" no implica talento innato — implica esfuerzo creativo acumulado
- El sistema de desbloqueo recompensa la acción (completar la clase), no el resultado
- Las entregas no tienen calificación — tienen reconocimiento: "Tu personaje ya existe en el mundo"
- Las insignias se otorgan por completar, no por "hacer bien" — refuerzan el esfuerzo, no el juicio

**Frase de diseño**: Nunca decimos "está bien hecho". Decimos "existe. Lo creaste tú."

---

## Qué NO es este curso

- No es un curso de programación (no se escribe código)
- No es un tutorial de herramientas (no se enseña ChatGPT como fin, sino como medio)
- No es un curso pasivo (cada clase termina con algo creado por el alumno)
- No reemplaza la creatividad del niño — la amplifica
