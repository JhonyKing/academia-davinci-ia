/**
 * Smoke tests — verifica que las páginas principales cargan sin errores.
 * No requieren login.
 */
import { test, expect } from '@playwright/test';

const CLASES = [
  { num: 1,  slug: 'clase1_bienvenido_genio'     },
  { num: 2,  slug: 'clase2_nace_el_personaje'    },
  { num: 3,  slug: 'clase3_retrato_oficial'      },
  { num: 4,  slug: 'clase4_tarjeta_oficial'      },
  { num: 5,  slug: 'clase5_los_arquetipos'       },
];

// ─── Errores de consola tolerables (recursos externos, etc.) ───────────────
const ALLOWED_ERRORS = [
  'favicon',
  'supabase',   // puede fallar en preview sin vars
  'cdn.jsdelivr', // puede fallar en red lenta
];

function isCriticalError(msg: string) {
  return !ALLOWED_ERRORS.some(k => msg.toLowerCase().includes(k));
}

// ─── Smoke: páginas cargan ─────────────────────────────────────────────────
test.describe('Smoke — Carga de páginas', () => {
  test('index.html carga y tiene título', async ({ page }) => {
    await page.goto('/clases/index.html');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
  });

  for (const c of CLASES) {
    test(`Clase ${c.num} — carga sin error JS crítico`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && isCriticalError(msg.text())) {
          errors.push(msg.text());
        }
      });

      await page.goto(`/clases/${c.slug}.html`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1500); // espera scripts async

      expect(errors, `Errores JS en clase ${c.num}: ${errors.join(' | ')}`).toHaveLength(0);
    });
  }
});

// ─── Kicker "Misión X de 26" ──────────────────────────────────────────────
test.describe('Kicker — visible y grande', () => {
  for (const c of CLASES) {
    test(`Clase ${c.num} — kicker dice "Misión ${c.num}"`, async ({ page }) => {
      await page.goto(`/clases/${c.slug}.html`);

      const kicker = page.locator('.kicker');
      await expect(kicker).toBeVisible();
      await expect(kicker).toContainText(`Misión ${c.num}`);

      // Verifica que sea suficientemente grande (>= 17px)
      const fontSize = await kicker.evaluate(el =>
        parseFloat(getComputedStyle(el).fontSize)
      );
      expect(fontSize).toBeGreaterThanOrEqual(17);
    });
  }
});

// ─── Performance básica ───────────────────────────────────────────────────
test.describe('Performance', () => {
  test('clase1 carga en menos de 5 segundos (domcontentloaded)', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/clases/clase1_bienvenido_genio.html', { waitUntil: 'domcontentloaded' });
    expect(Date.now() - t0).toBeLessThan(5000);
  });

  test('clase1 en móvil carga en menos de 8 segundos', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Solo Chromium para throttling');
    // Simula red lenta (3G)
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false, downloadThroughput: 750 * 1024 / 8,
      uploadThroughput: 250 * 1024 / 8, latency: 100,
    });
    const t0 = Date.now();
    await page.goto('/clases/clase1_bienvenido_genio.html', { waitUntil: 'domcontentloaded' });
    expect(Date.now() - t0).toBeLessThan(8000);
  });
});
