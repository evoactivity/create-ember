# Create Ember

> Generate scaffolding for Ember.js applications or addons

An interactive CLI tool to quickly scaffold new Ember.js projects with your preferred configuration and tools.

## Usage

### With pnpm (recommended)

```bash
pnpm create ember@latest
# or
yarn create ember@latest
# or
npm init ember@latest
```

## CLI Options

You can skip the interactive prompts by providing command-line flags:

```bash
pnpm create ember my-app --template app --typescript --git --eslint --prettier --qunit
```

Run `pnpm create ember --help` to see all available options.

### Available Options

| Option              | Description                             |
| ------------------- | --------------------------------------- |
| `--template <type>` | Project template type: `app` or `addon` |
| `--git`             | Initialize a Git repository             |
| `--typescript`      | Enable TypeScript support               |
| `--warpdrive`       | Include Warp Drive (data library)       |
| `--eslint`          | Include ESLint                          |
| `--prettier`        | Include Prettier                        |
| `--stylelint`       | Include Stylelint                       |
| `--templatelint`    | Include Ember Template Lint             |
| `--qunit`           | Setup browser-based QUnit testing       |
| `--vitest`          | Setup Vitest for unit testing           |

### Examples

Create an app with TypeScript and ESLint:

```bash
pnpm create ember my-app --template app --typescript --eslint
```

Create an addon with full linting setup:

```bash
pnpm create ember my-addon --template addon --eslint --prettier --stylelint --templatelint
```

## Development

### Prerequisites

- Node.js 24 or higher
- pnpm 10.24.0 or higher

### Setup

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Lint code
pnpm lint

# Format code
pnpm format
```

## Testing

The project uses Vitest for unit testing:

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with UI
pnpm test:ui
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
