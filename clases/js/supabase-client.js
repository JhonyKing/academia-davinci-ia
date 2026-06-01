// ──────────────────────────────────────────────
//  supabase-client.js
//  Cliente Supabase compartido — Academia Da Vinci IA
//  Rellena SUPABASE_URL y SUPABASE_ANON_KEY con
//  los valores de tu proyecto en supabase.com
// ──────────────────────────────────────────────

const SUPABASE_URL     = 'https://joiuvopzkorvmxegnjqg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaXV2b3B6a29ydm14ZWduanFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTc3OTEsImV4cCI6MjA5NTg3Mzc5MX0.Xf9wf5zngrvpaeZTbee0zd0LL5YoFtX8hwoYxCwrWnc'

// Carga la librería de Supabase desde CDN si todavía no existe
// (permite incluir este script antes del CDN tag si es necesario)
function _createClient() {
  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  // fallback: intentar desde el objeto global inyectado por el CDN UMD
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    return supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  throw new Error('[Da Vinci IA] Supabase CDN no cargado. Asegúrate de incluir el script CDN antes de supabase-client.js')
}

// Instancia única exportada como variable global
// Las demás páginas acceden a ella como `window._supabase`
window._supabase = _createClient()
