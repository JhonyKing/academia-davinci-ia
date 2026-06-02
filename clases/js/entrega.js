// ──────────────────────────────────────────────
//  entrega.js
//  Sistema de entregas para Academia Da Vinci IA
//  Incluir en las clases que requieran entrega.
//
//  Dependencias (incluir antes en el HTML):
//    1. https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js
//    2. js/supabase-client.js  →  window._supabase
//    3. js/auth.js             →  sesión ya verificada
//
//  Uso: colocar <div id="entrega-widget"></div> en el HTML
//       de la clase donde se quiere mostrar el widget.
// ──────────────────────────────────────────────

;(function () {
  'use strict'

  // ── Configuración de entregas por clase ──────────────────────────────────
  // Clases con entrega obligatoria o opcional según el numbering de 26 clases
  const SUBMISSION_CONFIG = {
    2:  { tipo: 'texto',           label: 'Describe tu personaje',                     required: true  },
    3:  { tipo: 'imagen',          label: 'Sube el retrato de tu personaje',            required: true  },
    4:  { tipo: 'imagen',          label: 'Sube la tarjeta oficial de tu personaje',    required: true  },
    5:  { tipo: 'eleccion',        label: 'Elige el arquetipo de tu personaje',         required: true  },
    7:  { tipo: 'imagen_multiple', label: 'Retratos de personajes secundarios',         required: false },
    10: { tipo: 'texto',           label: 'Pega tu guion aquí',                         required: true  },
    11: { tipo: 'texto',           label: 'Pega tus diálogos aquí',                     required: true  },
    14: { tipo: 'video_url',       label: 'Link de YouTube de tu primera animación',    required: true  },
    18: { tipo: 'video_url',       label: 'Link de YouTube de tu trailer',              required: true  },
    23: { tipo: 'video_url',       label: 'Link de YouTube de tu proyecto final',       required: true  },
  }

  // Arquetipos disponibles para tipo 'eleccion' (clase 5)
  const ARQUETIPOS = [
    { id: 'heroe',       emoji: '⚔️',  nombre: 'El Héroe',         desc: 'Lucha por proteger a los demás'      },
    { id: 'sabio',       emoji: '📚',  nombre: 'El Sabio',         desc: 'Su poder es el conocimiento'         },
    { id: 'explorador',  emoji: '🧭',  nombre: 'El Explorador',    desc: 'Descubre mundos desconocidos'         },
    { id: 'creador',     emoji: '🎨',  nombre: 'El Creador',       desc: 'Inventa y construye cosas nuevas'    },
    { id: 'guardian',    emoji: '🛡️',  nombre: 'El Guardián',      desc: 'Protege a los más vulnerables'       },
    { id: 'rebelde',     emoji: '⚡',  nombre: 'El Rebelde',       desc: 'Rompe las reglas para hacer el bien' },
    { id: 'inocente',    emoji: '✨',  nombre: 'El Inocente',      desc: 'Ve magia en todo lo que toca'        },
    { id: 'mago',        emoji: '🔮',  nombre: 'El Mago',          desc: 'Transforma la realidad con su poder' },
  ]

  // ── Detectar número de clase del filename ────────────────────────────────
  function getClaseNum() {
    const pathname = window.location.pathname
    const filename = pathname.split('/').pop()
    const match    = filename.match(/clase(\d+)/i)
    return match ? parseInt(match[1], 10) : null
  }

  // ── Sube imagen a Supabase Storage ───────────────────────────────────────
  // Path: {user_id}/clase_{N}/{timestamp}.{ext}
  async function uploadImagen(file, userId, claseNum) {
    if (file.size > 10 * 1024 * 1024) throw new Error('La imagen pesa más de 10MB. Elige una más pequeña.')
    const ext  = file.name.split('.').pop().toLowerCase()
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    if (!allowed.includes(ext)) throw new Error('Solo se aceptan imágenes JPG, PNG, WEBP o GIF.')
    const path = `${userId}/clase_${claseNum}/${Date.now()}.${ext}`
    const { error } = await window._supabase.storage
      .from('portafolio')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (error) throw new Error('Error al subir la imagen: ' + error.message)
    return path
  }

  // ── Guarda entrega en tabla entregas y marca progreso ────────────────────
  async function guardarEntrega(userId, claseNum, payload) {
    const { error } = await window._supabase
      .from('entregas')
      .upsert(
        { user_id: userId, clase_num: claseNum, ...payload, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,clase_num' }
      )
    if (error) throw new Error('Error guardando entrega: ' + error.message)

    // Marcar clase como completada en progress
    const { error: progError } = await window._supabase
      .from('progress')
      .upsert(
        { user_id: userId, clase_num: claseNum, completada: true, completada_at: new Date().toISOString() },
        { onConflict: 'user_id,clase_num' }
      )
    if (progError) console.warn('[Da Vinci IA] Error guardando progreso:', progError.message)
  }

  // ── Verifica si ya entregó esta clase ────────────────────────────────────
  async function verificarEntregaExistente(userId, claseNum) {
    const { data } = await window._supabase
      .from('entregas')
      .select('*')
      .eq('user_id', userId)
      .eq('clase_num', claseNum)
      .single()
    return data
  }

  // ── Construye HTML del formulario según tipo ─────────────────────────────
  function buildFormHTML(config, existente) {
    if (config.tipo === 'texto') {
      return `
        <textarea id="entrega-texto" rows="6"
          placeholder="Escribe aquí tu respuesta..."
          style="width:100%;background:#0F1626;color:#E8EAF0;border:1px solid #4A90D9;
                 border-radius:8px;padding:12px;font-family:'Poppins',sans-serif;
                 font-size:14px;line-height:1.7;resize:vertical;box-sizing:border-box;"
        >${existente?.contenido_texto || ''}</textarea>`

    } else if (config.tipo === 'imagen') {
      return `
        <div id="entrega-dropzone"
             onclick="document.getElementById('entrega-file').click()"
             style="border:2px dashed #4A90D9;border-radius:12px;padding:32px;
                    text-align:center;cursor:pointer;transition:background .2s;background:rgba(74,144,217,.04);"
             onmouseover="this.style.background='rgba(74,144,217,.1)'"
             onmouseout="this.style.background='rgba(74,144,217,.04)'">
          <div style="font-size:36px;margin-bottom:8px;">📁</div>
          <p style="color:#4A90D9;font-weight:600;margin-bottom:4px;">Haz clic para seleccionar una imagen</p>
          <p style="color:rgba(255,255,255,.4);font-size:13px;">JPG, PNG o WEBP — máx 10MB</p>
        </div>
        <input type="file" id="entrega-file" accept="image/*" style="display:none">
        <p id="entrega-file-name" style="color:#4A90D9;margin-top:8px;font-size:13px;"></p>
        ${existente?.archivo_url ? `
          <div style="background:rgba(39,174,96,.1);border:1px solid rgba(39,174,96,.3);
                      border-radius:8px;padding:10px 14px;margin-top:8px;font-size:13px;color:#2ECC71;">
            ✅ Ya subiste: <strong>${existente.archivo_nombre || 'imagen anterior'}</strong>
            — puedes subir una nueva para reemplazarla
          </div>` : ''}`

    } else if (config.tipo === 'imagen_multiple') {
      return `
        <p style="color:rgba(255,255,255,.5);font-size:14px;margin-bottom:12px;">
          Sube hasta 5 imágenes (una por personaje secundario). Se guardarán todas juntas.
        </p>
        <div id="entrega-dropzone"
             onclick="document.getElementById('entrega-file').click()"
             style="border:2px dashed #4A90D9;border-radius:12px;padding:32px;
                    text-align:center;cursor:pointer;transition:background .2s;background:rgba(74,144,217,.04);"
             onmouseover="this.style.background='rgba(74,144,217,.1)'"
             onmouseout="this.style.background='rgba(74,144,217,.04)'">
          <div style="font-size:36px;margin-bottom:8px;">🖼️</div>
          <p style="color:#4A90D9;font-weight:600;margin-bottom:4px;">Selecciona una o varias imágenes</p>
          <p style="color:rgba(255,255,255,.4);font-size:13px;">JPG, PNG o WEBP — máx 10MB por imagen</p>
        </div>
        <input type="file" id="entrega-file" accept="image/*" multiple style="display:none">
        <p id="entrega-file-name" style="color:#4A90D9;margin-top:8px;font-size:13px;"></p>
        ${existente?.archivos_urls?.length ? `
          <div style="background:rgba(39,174,96,.1);border:1px solid rgba(39,174,96,.3);
                      border-radius:8px;padding:10px 14px;margin-top:8px;font-size:13px;color:#2ECC71;">
            ✅ Ya subiste ${existente.archivos_urls.length} imagen(es) antes
          </div>` : ''}`

    } else if (config.tipo === 'video_url') {
      return `
        <div style="background:#1A2540;border-radius:12px;padding:20px;border-left:4px solid #F39C12;margin-bottom:12px;">
          <p style="color:#F39C12;font-weight:600;margin-bottom:10px;">📺 Consejos para subir a YouTube:</p>
          <ul style="color:rgba(255,255,255,.75);font-size:13px;line-height:2;margin-left:20px;">
            <li>Sube el video como <strong style="color:#fff;">Oculto</strong> si no tienes permiso de tus papás</li>
            <li>Si tus papás dan permiso, puedes subirlo como <strong style="color:#fff;">Público</strong></li>
            <li>¡Siempre pide ayuda a un adulto para subir a YouTube!</li>
          </ul>
        </div>
        <input type="url" id="entrega-url"
          placeholder="https://www.youtube.com/watch?v=..."
          value="${existente?.youtube_url || ''}"
          style="width:100%;background:#0F1626;color:#E8EAF0;border:1px solid #4A90D9;
                 border-radius:8px;padding:12px;font-family:'Poppins',sans-serif;
                 font-size:14px;box-sizing:border-box;">`

    } else if (config.tipo === 'eleccion') {
      const seleccionado = existente?.arquetipo_id || ''
      return `
        <div id="arquetipos-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:4px;">
          ${ARQUETIPOS.map(a => `
            <div class="arquetipo-card"
                 data-id="${a.id}"
                 onclick="window._seleccionarArquetipo('${a.id}')"
                 style="background:${seleccionado === a.id ? 'rgba(74,144,217,.2)' : 'rgba(255,255,255,.03)'};
                        border:2px solid ${seleccionado === a.id ? '#4A90D9' : 'rgba(255,255,255,.08)'};
                        border-radius:12px;padding:18px 14px;text-align:center;cursor:pointer;
                        transition:all .2s;"
                 onmouseover="if(this.dataset.selected!='1'){this.style.background='rgba(74,144,217,.08)';this.style.borderColor='rgba(74,144,217,.4)';}"
                 onmouseout="if(this.dataset.selected!='1'){this.style.background='rgba(255,255,255,.03)';this.style.borderColor='rgba(255,255,255,.08)';}">
              <div style="font-size:28px;margin-bottom:8px;">${a.emoji}</div>
              <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:4px;">${a.nombre}</div>
              <div style="font-size:11px;color:rgba(255,255,255,.5);line-height:1.4;">${a.desc}</div>
            </div>`).join('')}
        </div>
        <input type="hidden" id="entrega-arquetipo" value="${seleccionado}">`
    }
    return ''
  }

  // ── Renderiza el widget completo ─────────────────────────────────────────
  async function inicializarEntrega() {
    const claseNum = getClaseNum()
    if (!claseNum || !SUBMISSION_CONFIG[claseNum]) return

    const config    = SUBMISSION_CONFIG[claseNum]
    const container = document.getElementById('entrega-widget')
    if (!container) return

    const sb = window._supabase
    if (!sb) return

    const { data: { session } } = await sb.auth.getSession()
    if (!session) return
    const userId = session.user.id

    // Verificar entrega existente
    const existente = await verificarEntregaExistente(userId, claseNum)
    const yaEntrego = !!existente

    const formHTML    = buildFormHTML(config, existente)
    const badgeEntrego = yaEntrego
      ? `<div style="background:rgba(39,174,96,.15);border:1px solid rgba(39,174,96,.35);
                     color:#2ECC71;padding:10px 16px;border-radius:8px;margin-bottom:16px;font-size:14px;">
           ✅ ¡Ya entregaste esta misión! Puedes actualizarla cuando quieras.
         </div>`
      : ''

    container.innerHTML = `
      <div style="background:#1A2540;border-radius:16px;padding:28px;
                  border:1px solid rgba(74,144,217,.35);margin:32px 0;">
        <h3 style="color:#4A90D9;margin-bottom:6px;font-size:18px;">📬 Entrega tu Misión</h3>
        <p style="color:rgba(255,255,255,.55);margin-bottom:20px;font-size:14px;">${config.label}</p>
        ${badgeEntrego}
        ${formHTML}
        <div style="display:flex;align-items:center;gap:12px;margin-top:16px;flex-wrap:wrap;">
          <button id="btn-entregar"
                  onclick="window._entregarMision()"
                  style="background:#4A90D9;color:#fff;border:none;border-radius:8px;
                         padding:12px 28px;font-family:'Poppins',sans-serif;font-size:14px;
                         font-weight:600;cursor:pointer;transition:background .2s;"
                  onmouseover="this.style.background='#3A7BC8'"
                  onmouseout="this.style.background='#4A90D9'">
            ${yaEntrego ? '🔄 Actualizar entrega' : '🚀 Entregar Misión'}
          </button>
          ${!config.required ? '<span style="color:rgba(255,255,255,.35);font-size:12px;">(Entrega opcional)</span>' : ''}
        </div>
        <p id="entrega-msg" style="margin-top:12px;font-size:14px;"></p>
      </div>`

    // Marcar arquetipo previamente seleccionado
    if (config.tipo === 'eleccion' && existente?.arquetipo_id) {
      const card = container.querySelector(`[data-id="${existente.arquetipo_id}"]`)
      if (card) card.dataset.selected = '1'
    }

    // Listener para file input (imagen / imagen_multiple)
    const fileInput = document.getElementById('entrega-file')
    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const files   = fileInput.files
        const nameEl  = document.getElementById('entrega-file-name')
        if (!files || files.length === 0) { nameEl.textContent = ''; return }
        if (files.length === 1) {
          nameEl.textContent = `📎 ${files[0].name}`
        } else {
          nameEl.textContent = `📎 ${files.length} archivos seleccionados`
        }
      })
    }

    // Función global para seleccionar arquetipo
    window._seleccionarArquetipo = function (id) {
      // Limpiar todas las cards
      container.querySelectorAll('.arquetipo-card').forEach(el => {
        el.style.background    = 'rgba(255,255,255,.03)'
        el.style.borderColor   = 'rgba(255,255,255,.08)'
        el.dataset.selected    = '0'
      })
      // Marcar la seleccionada
      const card = container.querySelector(`[data-id="${id}"]`)
      if (card) {
        card.style.background  = 'rgba(74,144,217,.2)'
        card.style.borderColor = '#4A90D9'
        card.dataset.selected  = '1'
      }
      const input = document.getElementById('entrega-arquetipo')
      if (input) input.value = id
    }

    // ── Función global para enviar ─────────────────────────────────────────
    window._entregarMision = async function () {
      const btn = document.getElementById('btn-entregar')
      const msg = document.getElementById('entrega-msg')
      btn.disabled    = true
      btn.textContent = '⏳ Enviando...'
      msg.style.color = 'rgba(255,255,255,.5)'
      msg.textContent = ''

      try {
        let payload = { tipo: config.tipo }

        // ── Texto
        if (config.tipo === 'texto') {
          const texto = document.getElementById('entrega-texto')?.value.trim()
          if (!texto) throw new Error('Escribe algo antes de entregar.')
          payload.contenido_texto = texto
        }

        // ── Imagen única
        else if (config.tipo === 'imagen') {
          const file = document.getElementById('entrega-file')?.files[0]
          if (!file && !existente?.archivo_url) throw new Error('Selecciona una imagen antes de continuar.')
          if (file) {
            msg.style.color = 'rgba(255,255,255,.5)'
            msg.textContent = '📤 Subiendo imagen...'
            const path = await uploadImagen(file, userId, claseNum)
            payload.archivo_url    = path
            payload.archivo_nombre = file.name
          }
        }

        // ── Imagen múltiple
        else if (config.tipo === 'imagen_multiple') {
          const files = document.getElementById('entrega-file')?.files
          if ((!files || files.length === 0) && !existente?.archivos_urls?.length) {
            throw new Error('Selecciona al menos una imagen.')
          }
          if (files && files.length > 0) {
            msg.style.color = 'rgba(255,255,255,.5)'
            msg.textContent = `📤 Subiendo ${files.length} imagen(es)...`
            const paths = []
            const names = []
            for (const file of Array.from(files).slice(0, 5)) {
              const path = await uploadImagen(file, userId, claseNum)
              paths.push(path)
              names.push(file.name)
            }
            payload.archivos_urls    = paths
            payload.archivos_nombres = names
          }
        }

        // ── Video URL
        else if (config.tipo === 'video_url') {
          const url = document.getElementById('entrega-url')?.value.trim()
          if (!url) throw new Error('Ingresa el link de YouTube de tu video.')
          if (!url.match(/youtube\.com|youtu\.be/)) throw new Error('El link no parece ser de YouTube. Verifica e intenta de nuevo.')
          payload.youtube_url = url
        }

        // ── Elección de arquetipo
        else if (config.tipo === 'eleccion') {
          const arquetipo = document.getElementById('entrega-arquetipo')?.value
          if (!arquetipo) throw new Error('Selecciona un arquetipo antes de continuar.')
          const info = ARQUETIPOS.find(a => a.id === arquetipo)
          payload.arquetipo_id     = arquetipo
          payload.arquetipo_nombre = info?.nombre || arquetipo
        }

        await guardarEntrega(userId, claseNum, payload)

        msg.style.color = '#27AE60'
        msg.textContent = '✅ ¡Misión entregada! Sigue con la siguiente clase.'
        btn.textContent = '✅ Entregado'
        btn.style.background = '#27AE60'

        // Scroll suave a la navegación de lección si existe
        setTimeout(() => {
          document.querySelector('.lesson-nav')?.scrollIntoView({ behavior: 'smooth' })
        }, 1800)

      } catch (err) {
        msg.style.color = '#E74C3C'
        msg.textContent = '❌ ' + (err.message || 'Error al entregar. Intenta de nuevo.')
        btn.disabled    = false
        btn.textContent = existente ? '🔄 Actualizar entrega' : '🚀 Entregar Misión'
        btn.style.background = '#4A90D9'
        console.error('[Da Vinci IA] Error en entrega:', err)
      }
    }
  }

  // ── Auto-inicializar ──────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarEntrega)
  } else {
    // DOM ya disponible — esperar un tick para que auth.js establezca la sesión
    setTimeout(inicializarEntrega, 50)
  }

})()
