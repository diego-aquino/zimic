import test, { expect } from '@playwright/test';

import { githubFixtures } from '../../tests/interceptors/github/fixtures';

for (const prefix of ['app', 'pages']) {
  test.describe(`Home page: ${prefix}`, () => {
    const { repository } = githubFixtures;

    test.beforeEach(async ({ page }) => {
      await page.goto(`/${prefix}`);
    });

    test('should render a GitHub repository, if found', async ({ page }) => {
      const ownerInput = page.getByRole('textbox', { name: 'Owner' });
      await expect(ownerInput).toBeVisible();
      await ownerInput.fill(repository.owner.login);

      const repositoryInput = page.getByRole('textbox', { name: 'Repository' });
      await expect(repositoryInput).toBeVisible();
      await repositoryInput.fill(repository.name);

      const submitButton = page.getByRole('button', { name: 'Search' });
      await expect(submitButton).toBeVisible();
      await submitButton.click();

      await expect(page).toHaveURL(`/${prefix}?owner=${repository.owner.login}&repo=${repository.name}`);

      const repositoryLink = page.getByRole('link', { name: repository.full_name });
      await expect(repositoryLink).toBeVisible();
      await expect(repositoryLink).toHaveAttribute('href', repository.html_url);
      await expect(repositoryLink).toHaveAttribute('target', '_blank');
      await expect(repositoryLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('should render a message if the GitHub repository is not found', async ({ page }) => {
      const ownerInput = page.getByRole('textbox', { name: 'Owner' });
      await expect(ownerInput).toBeVisible();
      await ownerInput.fill('unknown');

      const repositoryInput = page.getByRole('textbox', { name: 'Repository' });
      await expect(repositoryInput).toBeVisible();
      await repositoryInput.fill('unknown');

      const submitButton = page.getByRole('button', { name: 'Search' });
      await expect(submitButton).toBeVisible();
      await submitButton.click();

      await expect(page).toHaveURL(`/${prefix}?owner=unknown&repo=unknown`);

      const notFoundMessage = page.getByRole('status');
      await expect(notFoundMessage).toBeVisible();
      await expect(notFoundMessage).toHaveText('Repository not found.');
    });
  });
}
