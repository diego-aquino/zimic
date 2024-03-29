<h1>
  Zimic + Vitest + Browser Mode
</h2>

This example uses Zimic with [Vitest](https://vitest.dev) with [Browser Mode](https://vitest.dev/guide/browser) enabled.
It uses [Playwright](https://playwright.dev) as the browser provider for Vitest and
[Testing Library](https://testing-library.com).

## Application

A simple HTML layout rendered by vanilla JavaScript, fetching repositories from the
[GitHub API](https://docs.github.com/en/rest).

- Application: [`src/app.ts`](./src/app.ts)

A `postinstall` script is used to install Playwright's browsers and initialize Zimic's mock service worker to the
`./public` directory. The mock service worker at `./public/mockServiceWorker.js` is ignored in the
[`.gitignore`](./.gitignore) file.

## Testing

An example test suite uses Vitest to test the application. Zimic is used to mock the GitHub API and simulate a test case
where the repository is found and another where it is not.

### Zimic

- Zimic worker: [`tests/interceptors/worker.ts`](./tests/interceptors/worker.ts)
- Zimic GitHub interceptor: [`tests/interceptors/githubInterceptor.ts`](./tests/interceptors/githubInterceptor.ts)

### Test

- Test suite: [`tests/example.test.ts`](./tests/example.test.ts)

- Test setup file: [`tests/browserSetup.ts`](./tests/browserSetup.ts)

  > IMPORTANT: As a workaround, this setup file must be imported in each test file. Currently, Browser Mode is
  > experimental and Vitest runs the setup file in a different process than the test files, so the worker started on
  > [`tests/browserSetup.ts`](./tests/browserSetup.ts) is not shared between them.

#### Configuration

- Vitest configuration: [`vitest.config.mts`](./vitest.config.mts)
