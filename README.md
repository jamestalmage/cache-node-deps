# setup-node

[![basic-validation](https://github.com/jamestalmage/cache-node-deps/actions/workflows/basic-validation.yml/badge.svg)](https://github.com/jamestalmage/cache-node-deps/actions/workflows/basic-validation.yml)
[![versions](https://github.com/jamestalmage/cache-node-deps/actions/workflows/versions.yml/badge.svg)](https://github.com/jamestalmage/cache-node-deps/actions/workflows/versions.yml)
[![e2e-cache](https://github.com/jamestalmage/cache-node-deps/actions/workflows/e2e-cache.yml/badge.svg?branch=main)](https://github.com/jamestalmage/cache-node-deps/actions/workflows/e2e-cache.yml)
[![proxy](https://github.com/jamestalmage/cache-node-deps/actions/workflows/proxy.yml/badge.svg)](https://github.com/jamestalmage/cache-node-deps/actions/workflows/proxy.yml)

This action provides the following functionality for GitHub Actions users:

- Caching npm/yarn/pnpm dependencies

It was originally forked from [actions/setup-node](https://github.com/actions/setup-node) to extract the dependency caching functionality as a standalone action.
Use case is for alternate tooling (i.e. [moon](https://moonrepo.dev/)) that manages Node.js versions and package installation, but still wants to leverage GitHub Actions caching for dependencies.

## Usage

See [action.yml](action.yml)

<!-- start usage -->
```yaml
- uses: jamestalmage/cache-node-deps@v6
  with:
    # All inputs are optional
    
    # Used to specify a package manager for caching in the default directory. Supported values: npm, yarn, pnpm.
    # Package manager should be pre-installed
    package-manager-cache: 'true'

    # Used to specify the path to a dependency file: package-lock.json, yarn.lock, etc. 
    # It will generate hash from the target file for primary key. It works only If cache is specified.  
    # Supports wildcards or a list of file names for caching multiple dependencies.
    # Default: ''
    cache-dependency-path: ''

```
<!-- end usage -->

**Basic:**

```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version: 24
- run: npm ci
- run: npm test
```


### Checking in lockfiles

It's **always** recommended to commit the lockfile of your package manager for security and performance reasons. 

## Caching global packages data

The action has a built-in functionality for caching and restoring dependencies. It uses [actions/cache](https://github.com/actions/cache) under the hood for caching global packages data but requires less configuration settings. Supported package managers are `npm`, `yarn`, `pnpm` (v6.10+).

The action defaults to search for the dependency file (`package-lock.json`, `npm-shrinkwrap.json` or `yarn.lock`) in the repository root, and uses its hash as a part of the cache key. Use `cache-dependency-path` for cases when multiple dependency files are used, or they are located in different subdirectories.

**Note:** The action does not cache `node_modules`

See the examples of using cache for `yarn`/`pnpm` and `cache-dependency-path` input in the [Advanced usage](docs/advanced-usage.md#caching-packages-data) guide.

**Caching npm dependencies:**

```yaml
steps:
- uses: actions/checkout@v5
- uses: jamestalmage/cache-node-deps@v6
  with:
    node-version: 24
    cache: 'npm'
- run: npm ci
- run: npm test
```

**Caching npm dependencies in monorepos:**

```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    node-version: 24
    cache: 'npm'
    cache-dependency-path: subdir/package-lock.json
- run: npm ci
- run: npm test
```

Caching for npm dependencies is automatically enabled when your `package.json` contains either `devEngines.packageManager` field or top-level `packageManager` field set to `npm`, and no explicit cache input is provided.

This behavior is controlled by the `package-manager-cache` input, which defaults to `true`. To turn off automatic caching, set `package-manager-cache` to `false`.

```yaml
steps:
- uses: actions/checkout@v5
- uses: actions/setup-node@v6
  with:
    package-manager-cache: false
- run: npm ci
```
> If your `package.json` file does not include a `packageManager` field set to `npm`, caching will be disabled unless you explicitly enable it. For workflows with elevated privileges or access to sensitive information, we recommend disabling automatic caching for npm by setting `package-manager-cache: false` when caching is not required for secure operation.

## Matrix Testing

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [ 20, 22, 24 ]
    name: Node ${{ matrix.node }} sample
    steps:
      - uses: actions/checkout@v5
      - name: Setup node
        uses: actions/setup-node@v6
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
```

## Recommended permissions

When using the `cache-node-deps` action in your GitHub Actions workflow, it is recommended to set the following permissions to ensure proper functionality:

```yaml
permissions:
  contents: read # access to check out code and install dependencies
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)

## Contributions

Contributions are welcome!

## Code of Conduct

:wave: Be nice. See [our code of conduct](CODE_OF_CONDUCT.md)
