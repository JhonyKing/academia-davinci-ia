/* ============================================================
   upload-zone.js — Zona de entrega reutilizable
   Academia Da Vinci IA

   Uso:
     new DvUploadZone({
       containerId : 'mi-div',   // ID del div contenedor (vacío)
       claseNum    : 2,           // número de clase
       tipo        : 'dibujo',   // tipo único de entrega (clave en BD)
       label       : 'Sube tu dibujo',
       sublabel    : 'Texto opcional bajo el título',
       icon        : '✏️',       // emoji principal (default 🖼️)
       color       : '#F39C12',  // color del borde animado (default #4A90D9)
       accept      : 'image/*',  // tipos de archivo (default image/*)
       bucket      : 'portafolio' // Supabase bucket (default portafolio)
     });
   ============================================================ */

window.DvUploadZone = function (cfg) {
  var el = document.getElementById(cfg.containerId);
  if (!el) return;

  var icon   = cfg.icon    || '🖼️';  // 🖼️
  var color  = cfg.color   || '#E74C3C';
  var label  = cfg.label   || 'Sube tu archivo';
  var sub    = cfg.sublabel || '';
  var accept = cfg.accept  || 'image/*';
  var bucket = cfg.bucket  || 'portafolio';
  var p      = cfg.containerId;   // prefijo para IDs de elementos internos

  el.innerHTML = [
    '<div style="font-weight:900;color:', color, ';font-size:13px;text-transform:uppercase;',
    'letter-spacing:.07em;margin-bottom:14px;display:flex;align-items:center;gap:8px;">',
      '<span>', icon, '</span> ', label,
    '</div>',
    sub ? '<p style="color:rgba(30,37,71,.75);font-size:13px;font-weight:600;margin:-8px 0 14px;">' + sub + '</p>' : '',

    /* drop box */
    '<div id="', p, '-box" style="position:relative;border-radius:16px;padding:38px 20px;',
    'text-align:center;cursor:pointer;background:rgba(36,10,10,.75);min-height:150px;',
    'display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;">',

      '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" ',
      'style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;">',
        '<rect x="1" y="1" width="98" height="98" rx="3" fill="none" stroke="', color, '" ',
        'stroke-width="2" stroke-dasharray="9 6" stroke-linecap="round" vector-effect="non-scaling-stroke">',
          '<animate attributeName="stroke-dashoffset" from="0" to="-15" dur="1.2s" repeatCount="indefinite"/>',
        '</rect>',
      '</svg>',

      '<div style="font-size:46px;margin-bottom:10px;line-height:1;">', icon, '</div>',
      '<div style="color:rgba(255,255,255,.85);font-weight:700;font-size:15px;">Arrastra aquí</div>',
      '<div style="color:rgba(255,255,255,.35);font-size:13px;margin:6px 0 14px;">— o —</div>',
      '<button id="', p, '-sel" type="button" ',
        'style="background:', color, '22;border:1.5px solid ', color, '88;color:', color, ';',
        'font-weight:800;font-size:14px;padding:10px 26px;border-radius:10px;cursor:pointer;">',
        'Seleccionar archivo</button>',
      '<input id="', p, '-inp" type="file" accept="', accept, '" style="display:none;">',
    '</div>',

    /* preview */
    '<div id="', p, '-prev" style="display:none;margin-top:14px;border-radius:16px;overflow:hidden;',
    'background:#1a1f35;border:1px solid rgba(255,255,255,.08);">',
      '<img id="', p, '-img" alt="" style="width:100%;max-height:300px;object-fit:cover;display:block;">',
      '<div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;',
      'gap:12px;flex-wrap:wrap;">',
        '<div id="', p, '-fname" style="color:rgba(255,255,255,.5);font-size:12px;flex:1;min-width:0;',
        'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></div>',
        '<button id="', p, '-up" type="button" style="background:', color, ';color:#fff;',
        'font-weight:800;font-size:14px;padding:11px 24px;border-radius:10px;border:none;cursor:pointer;">',
        'Subir ↑</button>',
      '</div>',
      '<div id="', p, '-st" style="display:none;padding:0 16px 14px;font-size:13px;font-weight:600;"></div>',
    '</div>',

    /* success */
    '<div id="', p, '-ok" style="display:none;margin-top:14px;background:rgba(34,194,104,.1);',
    'border:1.5px solid rgba(34,194,104,.3);border-radius:14px;padding:16px 18px;text-align:center;">',
      '<div style="color:#22C268;font-weight:800;font-size:16px;">✅ ¡Entregado!</div>',
      '<div id="', p, '-oknm" style="color:rgba(255,255,255,.4);font-size:12px;margin-top:4px;"></div>',
      '<button id="', p, '-chg" type="button" style="margin-top:10px;background:transparent;',
      'border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.5);font-size:12px;',
      'padding:6px 14px;border-radius:8px;cursor:pointer;">Cambiar</button>',
    '</div>',
  ].join('');

  var box  = document.getElementById(p + '-box');
  var inp  = document.getElementById(p + '-inp');
  var sel  = document.getElementById(p + '-sel');
  var prev = document.getElementById(p + '-prev');
  var imgE = document.getElementById(p + '-img');
  var fn   = document.getElementById(p + '-fname');
  var up   = document.getElementById(p + '-up');
  var st   = document.getElementById(p + '-st');
  var okEl = document.getElementById(p + '-ok');
  var oknm = document.getElementById(p + '-oknm');
  var chg  = document.getElementById(p + '-chg');
  var file = null;

  function pick() { inp.click(); }
  box.addEventListener('click', pick);
  sel.addEventListener('click', function (e) { e.stopPropagation(); pick(); });

  box.addEventListener('dragover', function (e) { e.preventDefault(); box.style.background = 'rgba(231,76,60,.15)'; });
  box.addEventListener('dragleave', function () { box.style.background = 'rgba(36,10,10,.75)'; });
  box.addEventListener('drop', function (e) {
    e.preventDefault(); box.style.background = 'rgba(13,18,36,.7)';
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });
  inp.addEventListener('change', function () { if (inp.files[0]) setFile(inp.files[0]); });
  chg.addEventListener('click', function () {
    okEl.style.display = 'none'; prev.style.display = 'none';
    box.style.display = 'flex'; inp.value = '';
  });

  function setFile(f) {
    file = f;
    if (f.type.startsWith('image/')) { imgE.src = URL.createObjectURL(f); imgE.style.display = 'block'; }
    else imgE.style.display = 'none';
    fn.textContent = f.name + ' · ' + (f.size / 1024).toFixed(0) + ' KB';
    box.style.display  = 'none';
    okEl.style.display = 'none';
    prev.style.display = 'block';
    st.style.display   = 'none';
    up.disabled = false; up.textContent = 'Subir ↑';
  }

  up.addEventListener('click', async function () {
    if (!file) return;
    var sb = window._supabase;
    if (!sb) {
      st.style.display = 'block'; st.style.color = '#F39C12';
      st.textContent = 'Inicia sesión para guardar tu entrega.'; return;
    }
    up.disabled = true; up.textContent = 'Subiendo...';
    st.style.display = 'block'; st.style.color = 'rgba(255,255,255,.45)';
    st.textContent = 'Subiendo a la nube...';
    try {
      var user = (await sb.auth.getUser()).data.user;
      if (!user) throw new Error('Inicia sesión para guardar.');
      var ext  = (file.name.split('.').pop() || 'bin').toLowerCase();
      var path = user.id + '/clase' + cfg.claseNum + '/' + cfg.tipo + '/' + Date.now() + '.' + ext;
      var uErr = (await sb.storage.from(bucket).upload(path, file, { upsert: true })).error;
      if (uErr) throw uErr;
      var row  = (await sb.from('entregas').select('id')
        .eq('user_id', user.id).eq('clase_num', cfg.claseNum).eq('tipo', cfg.tipo).maybeSingle()).data;
      var dbResult;
      if (row) {
        dbResult = await sb.from('entregas').update({ archivo_url: path, archivo_nombre: file.name, metadata: { storage_path: path } }).eq('id', row.id);
      } else {
        dbResult = await sb.from('entregas').insert({ user_id: user.id, clase_num: cfg.claseNum, tipo: cfg.tipo, archivo_url: path, archivo_nombre: file.name, metadata: { storage_path: path } });
      }
      if (dbResult.error) throw dbResult.error;
      prev.style.display = 'none';
      okEl.style.display = 'block';
      oknm.textContent   = file.name;
      // Notificar entrega para desbloqueo de insignia.
      // Con onUploaded la página decide cuándo está completa (varias zonas);
      // sin él, una sola subida completa la entrega.
      if (cfg.onUploaded) cfg.onUploaded(cfg.tipo);
      else window._entregaDone = true;
      if (window.checkBadgeUnlock) window.checkBadgeUnlock();
    } catch (e) {
      st.style.color = '#E74C3C';
      st.textContent = 'Error: ' + (e.message || 'Intenta de nuevo');
      up.disabled = false; up.textContent = 'Subir ↑';
    }
  });

  function checkExisting() {
    var sb = window._supabase;
    if (!sb) return;
    sb.auth.getUser().then(function (r) {
      var user = r.data && r.data.user;
      if (!user) return;
      sb.from('entregas').select('archivo_url,archivo_nombre')
        .eq('user_id', user.id).eq('clase_num', cfg.claseNum).eq('tipo', cfg.tipo).maybeSingle()
        .then(function (r2) {
          if (r2.data && r2.data.archivo_url) {
            box.style.display  = 'none';
            prev.style.display = 'none';
            okEl.style.display = 'block';
            oknm.textContent   = r2.data.archivo_nombre || '';
            // Ya había entrega — notificar igual que en subida nueva
            if (cfg.onUploaded) cfg.onUploaded(cfg.tipo);
            else window._entregaDone = true;
            if (window.checkBadgeUnlock) window.checkBadgeUnlock();
          }
        });
    });
  }

  var _iv = setInterval(function () { if (window._supabase) { clearInterval(_iv); checkExisting(); } }, 500);
};
