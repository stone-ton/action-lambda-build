# action-lambda-build

This action provides the following functionality for GitHub Actions users:

- Build .js .ts files with esbuild
- Individualy build by serverless.yml config
- Bundle, minify and add source map
- Zip each files

## Usage

See [action.yml](action.yml)

**Basic:**

.github/workflows/deploy.yml
```yaml
steps:
- uses: actions/checkout@v3
- uses: actions/setup-node@v3
  with:
    node-version: '16'

- run: npm ci
- run: npm test

- uses: stone-ton/action-lambda-build@v1
```

serverles.yml
```yaml
functions:
  lambda-foo:
    handler: src/foo/index.handler
  lambda-bar:
    handler: src/bar/index.handler
```

Output

```
📂 build
├── lambda-foo.zip
└── lambda-bar.zip
```