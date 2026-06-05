/* ============================================================
   logros.js — Sistema de trofeos e insignias
   Academia Da Vinci IA
   Registra logros en Supabase tabla "logros"
   ============================================================ */

;(function () {
  'use strict';

  /**
   * Guarda un logro en Supabase.
   * Si ya existe (mismo clave), actualiza con los nuevos datos.
   *
   * @param {object} opts
   * @param {string} opts.clave    - ID único del logro (ej: 'insignia_clase_5')
   * @param {string} opts.titulo   - Nombre del logro (ej: 'Descubridor de Arquetipos')
   * @param {string} opts.emoji    - Emoji representativo (ej: '🌟')
   * @param {string} [opts.tipo]   - 'insignia' | 'trofeo' | 'reto' | 'campeon'
   * @param {string} [opts.subtitulo] - Texto secundario (ej: 'Clase 5 de 26')
   * @param {string} [opts.color]  - Color hex del logro (ej: '#E74C3C')
   */
  async function dvAwardLogro({ clave, titulo, emoji, tipo, subtitulo, color }) {
    try {
      const sb = window._supabase;
      if (!sb) return;
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      await sb.from('logros').upsert(
        {
          user_id:  user.id,
          clave:    clave,
          titulo:   titulo,
          emoji:    emoji    || '🏆',
          tipo:     tipo     || 'insignia',
          subtitulo: subtitulo || '',
          color:    color    || '',
          fecha_ganado: new Date().toISOString(),
        },
        { onConflict: 'user_id,clave' }
      );
    } catch (e) {
      console.warn('[logros] dvAwardLogro error:', e);
    }
  }

  window.dvAwardLogro = dvAwardLogro;

})();
