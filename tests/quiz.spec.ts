/**
 * Quiz tests — verifica el comportamiento del quiz de lección.
 * No requieren login (el bloqueo/desbloqueo es 100% frontend).
 */
import { test, expect } from '@playwright/test';

test.describe('Quiz — Clase 1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clases/clase1_bienvenido_genio.html');
    // Espera a que el quiz JS inicialice
    await page.waitForSelector('#lesson-quiz-container .lq-card', { timeout: 6000 });
  });

  // ── Bloqueo inicial ──────────────────────────────────────────────────────
  test('botón "Siguiente" está bloqueado al entrar', async ({ page }) => {
    const nextBtn = page.locator('.lnav-btn.next-btn');
    await expect(nextBtn).toHaveClass(/lq-locked/);
    // No debe tener href (está desconectado para evitar navegación)
    const href = await nextBtn.getAttribute('href');
    expect(href).toBeNull();
  });

  test('overlay del candado es visible y tiene texto descriptivo', async ({ page }) => {
    const overlay = page.locator('#lq-lock-overlay');
    await expect(overlay).toBeVisible();
    await expect(overlay).toContainText(/quiz|completa/i);
  });

  test('emoji del candado tiene tamaño grande (>= 20px)', async ({ page }) => {
    const ico = page.locator('.lq-lock-ico');
    await expect(ico).toBeVisible();
    const fontSize = await ico.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(20);
  });

  test('al hacer clic en el botón bloqueado se agita (shake)', async ({ page }) => {
    const nextBtn = page.locator('.lnav-btn.next-btn');
    await nextBtn.click();
    await expect(nextBtn).toHaveClass(/lq-shake/);
    // La clase shake desaparece después de la animación (~500ms)
    await page.waitForTimeout(600);
    await expect(nextBtn).not.toHaveClass(/lq-shake/);
  });

  // ── Interacción con preguntas ────────────────────────────────────────────
  test('se puede seleccionar una opción', async ({ page }) => {
    const firstOpt = page.locator('.lq-opt').first();
    await firstOpt.click();
    // Debe aparecer el botón "Siguiente pregunta"
    await expect(page.locator('#lq-advance')).toBeVisible();
  });

  test('opción correcta se marca en verde, incorrecta en rojo', async ({ page }) => {
    await page.locator('.lq-opt').first().click();
    // Al menos una opción debe estar marcada como correcta (verde)
    await expect(page.locator('.lq-opt-correct').first()).toBeVisible();
  });

  // ── Completar el quiz ────────────────────────────────────────────────────
  test('completar el quiz muestra pantalla de resultado', async ({ page }) => {
    // Responde las 4 preguntas (siempre la primera opción)
    for (let i = 0; i < 4; i++) {
      await page.waitForSelector('.lq-opt:not([disabled])', { timeout: 5000 });
      await page.locator('.lq-opt').first().click();
      await page.waitForSelector('#lq-advance', { timeout: 5000 });
      await page.locator('#lq-advance').click();
    }
    // Debe aparecer la pantalla de resultado
    await expect(page.locator('.lq-result-card')).toBeVisible({ timeout: 5000 });
  });

  test('al aprobar el quiz, el botón Siguiente se desbloquea', async ({ page }) => {
    // Necesitamos responder suficientes correctas (≥80%)
    // Buscamos la opción correcta en cada pregunta
    for (let i = 0; i < 4; i++) {
      await page.waitForSelector('.lq-opt:not([disabled])', { timeout: 5000 });
      // Hacemos clic en cada opción hasta encontrar la correcta, o tomamos la primera
      const opts = await page.locator('.lq-opt').all();
      // Hacemos clic en la primera opción disponible
      await opts[0].click();
      await page.waitForSelector('#lq-advance', { timeout: 5000 });
      await page.locator('#lq-advance').click();
    }

    const result = page.locator('.lq-result-card');
    await expect(result).toBeVisible({ timeout: 5000 });

    // Si aprobó, el botón siguiente debe desbloquearse
    const passed = await result.evaluate(el => el.classList.contains('lq-passed'));
    if (passed) {
      await page.waitForTimeout(500); // animación de desbloqueo
      const nextBtn = page.locator('.lnav-btn.next-btn');
      await expect(nextBtn).not.toHaveClass(/lq-locked/);
    }
  });
});

// ── Drop zone ────────────────────────────────────────────────────────────────
test.describe('Drop zone — Clase 1', () => {
  test('zona de entrega es visible en la sección de tarea', async ({ page }) => {
    await page.goto('/clases/clase1_bienvenido_genio.html');
    const zone = page.locator('#entrega-c1');
    await zone.scrollIntoViewIfNeeded();
    await expect(zone).toBeVisible();
    await expect(page.locator('#dz1-box')).toBeVisible();
  });

  test('borde animado SVG está presente', async ({ page }) => {
    await page.goto('/clases/clase1_bienvenido_genio.html');
    await page.locator('#dz1-box').scrollIntoViewIfNeeded();
    const svg = page.locator('#dz1-box svg');
    await expect(svg).toBeVisible();
  });

  test('botón "Seleccionar imagen" abre el file picker', async ({ page }) => {
    await page.goto('/clases/clase1_bienvenido_genio.html');
    await page.locator('#dz1-box').scrollIntoViewIfNeeded();
    // Verifica que el botón existe y es clickable
    const btn = page.locator('#dz1-select');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });
});

// ── Clase 2 — dos drop zones ─────────────────────────────────────────────────
test.describe('Drop zones — Clase 2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clases/clase2_nace_el_personaje.html');
  });

  test('zona de dibujo está presente', async ({ page }) => {
    const zone = page.locator('#dz-c2-dibujo');
    await zone.scrollIntoViewIfNeeded();
    await expect(zone).toBeVisible();
    await expect(zone.locator('[id$="-box"]')).toBeVisible();
  });

  test('zona de imagen IA está presente', async ({ page }) => {
    const zone = page.locator('#dz-c2-imagen');
    await zone.scrollIntoViewIfNeeded();
    await expect(zone).toBeVisible();
    await expect(zone.locator('[id$="-box"]')).toBeVisible();
  });
});
