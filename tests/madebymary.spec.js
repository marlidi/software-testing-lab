// Автоматизовані тести вебсайту https://madebymary.pl/
// Бібліотека: Playwright (@playwright/test)
const { test, expect } = require('@playwright/test');

// Перед кожним тестом відкриваємо головну сторінку
// та закриваємо банер cookie (якщо він з'явився), щоб він не заважав
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  const rejectCookies = page.locator('[data-consent-reject]');
  if (await rejectCookies.isVisible().catch(() => false)) {
    await rejectCookies.click();
  }
});

// Перевірка 1: сайт відкривається та має правильний заголовок
test('Перевірка 1: заголовок сторінки', async ({ page }) => {
  // Перевіряємо заголовок вкладки браузера
  await expect(page).toHaveTitle(/Made by Mary/);
  // Перевіряємо, що головний заголовок H1 відображається
  await expect(page.locator('h1')).toBeVisible();
});

// Перевірка 2: меню навігації містить потрібні пункти та переводить до розділу
test('Перевірка 2: навігаційне меню', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Main navigation' });

  // Перевіряємо наявність усіх пунктів меню
  for (const item of ['Home', 'About me', 'Projects', 'Contacts']) {
    await expect(nav.getByRole('link', { name: item })).toHaveCount(1);
  }

  // На мобільних екранах меню сховане під кнопкою "бургер" — відкриваємо його
  const burger = page.locator('[data-navbar-toggle]');
  if (await burger.isVisible()) {
    await burger.click();
  }

  // Натискаємо "Projects" і перевіряємо, що адреса змінилась на #projects
  await nav.getByRole('link', { name: 'Projects' }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('#projects')).toBeInViewport();
});

// Перевірка 3: натискання на картку проєкту відкриває вікно з описом
test('Перевірка 3: відкриття та закриття вікна проєкту', async ({ page }) => {
  // Натискаємо на картку проєкту "Flowing"
  await page.locator('[data-project-open="flowing"]').click();

  // Перевіряємо, що діалогове вікно проєкту відкрилося
  const dialog = page.locator('#project-dialog-flowing');
  await expect(dialog).toBeVisible();

  // Закриваємо вікно кнопкою "X" і перевіряємо, що воно зникло
  await dialog.getByRole('button', { name: 'Close Flowing project' }).click();
  await expect(dialog).toBeHidden();
});

// Перевірка 4: форма контактів не проходить перевірку з некоректними даними
test('Перевірка 4: валідація контактної форми', async ({ page }) => {
  const form = page.locator('[data-contact-form]');
  const nameInput = page.locator('#contact-name');
  const emailInput = page.locator('#contact-email');

  // Вводимо некоректну адресу e-mail
  await nameInput.fill('Тестовий користувач');
  await emailInput.fill('nie-email');

  // Перевіряємо, що браузер вважає поле e-mail некоректним
  const emailValid = await emailInput.evaluate((el) => el.checkValidity());
  expect(emailValid).toBe(false);

  // Очищаємо ім'я — обов'язкове поле стає некоректним
  await nameInput.fill('');
  const nameValid = await nameInput.evaluate((el) => el.checkValidity());
  expect(nameValid).toBe(false);

  // Уся форма не проходить перевірку, тож дані не будуть надіслані
  const formValid = await form.evaluate((el) => el.checkValidity());
  expect(formValid).toBe(false);
});

// Перевірка 5: перехід на сторінку політики конфіденційності
test('Перевірка 5: перехід на сторінку Privacy policy', async ({ page }) => {
  // Натискаємо посилання "privacy policy" у контактній формі
  await page.locator('.contact-form').getByRole('link', { name: /privacy policy/i }).click();

  // Перевіряємо, що відкрилась нова сторінка /privacy
  await expect(page).toHaveURL(/\/privacy/);
  await expect(page.locator('h1')).toBeVisible();
});
