import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Willkommen - Flashcards/);
  });

  test('should display main heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading.getByText('Willkommen bei Flashcards')).toBeVisible();
  });

  test('should display subtitle text', async ({ page }) => {
    const subtitle = page.getByRole('paragraph').first();
    await expect(subtitle.getByText(/Lerne effektiver mit digitalen Karteikarten/)).toBeVisible();
  });

  test('should display register button', async ({page}) => {
    const registerButton = page.getByRole('link', { name: 'Registrieren' });
    await expect(registerButton.getByText('Jetzt starten')).toBeVisible();
    await expect(registerButton).toHaveAttribute('href', '/auth/register');
    await expect(registerButton).toHaveAttribute('aria-label', 'Registrieren');
  });

  test('should display login button', async ({page}) => {
    const loginButton = page.getByRole('link', { name: 'Anmelden' });
    await expect(loginButton.getByText('Anmelden')).toBeVisible();
    await expect(loginButton).toHaveAttribute('href', '/auth/login');
    await expect(loginButton).toHaveAttribute('aria-label', 'Anmelden');
  });

  test('should display feature cards', async ({page}) => {
    const featuresCards = page.getByRole('article').all();
    expect((await featuresCards).length).toBe(3);
    
    await expect(page.getByText('Effektives Lernen')).toBeVisible();
    await expect(page.getByText('Überall verfügbar')).toBeVisible();
    await expect(page.getByText('Einfach teilen')).toBeVisible();
  });
});

test.describe('Navigation Flows', () => {
  test('should navigate to register page and back', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: 'Registrieren' }).click();
    await expect(page).toHaveTitle(/Registrieren - Flashcards/);
    
    await page.goto('/');
    await expect(page).toHaveTitle(/Willkommen - Flashcards/);
  });

  test('should navigate to login page and back', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: 'Anmelden' }).click();
    await expect(page).toHaveTitle(/Anmelden - Flashcards/);
    
    await page.goto('/');
    await expect(page).toHaveTitle(/Willkommen - Flashcards/);
  });
});
