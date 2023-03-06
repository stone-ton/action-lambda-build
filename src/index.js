// @ts-check
const {
  readdirSync,
  rmSync,
} = require('fs')
const fse = require('fs-extra')
const path = require('path')

const buildESBuildLambda = require('./builders/esbuild')
const getFiles = require('./utils/get-files')
const parseHandlersFiles = require('./utils/parse-handlers-files')
const parseHandlersYML = require('./utils/parse-handlers-yml')
const zipDirectory = require('./utils/zip-directory')

const builders = {
  esbuild: buildESBuildLambda,
}

/**
 * @typedef {{
 *  base_dir?: string,
 *  builder?: string,
 *  bundle?: boolean,
 *  external?: string[],
 *  functions?: string,
 *  individually?: boolean,
 *  minify?: boolean
 *  outdir?: string,
 *  sourcemap?: boolean,
 *  three_shaking?: boolean,
 *  zip?: boolean,
 *  loader?: object,
 * }} BuildOptions
 *
 * @param {BuildOptions} options
 */
const buildRun = async (options = {}) => {
  const {
    outdir = 'build',
  } = options

  const fullOutDir = outdir + (options.individually
    ? ''
    : '/lambdas')

  const buildOptions = {
    base_dir: options.base_dir ?? 'src',
    builder: options.builder ?? 'esbuild',
    bundle: options.bundle ?? true,
    external: options.external ?? ['aws-sdk'],
    functions: options.functions ?? 'serverless.yml',
    individually: options.individually ?? true,
    minify: options.minify ?? true,
    outdir: fullOutDir,
    sourcemap: options.sourcemap ?? true,
    three_shaking: options.three_shaking ?? true,
    zip: options.zip ?? true,
    loader: options.loader,
  }

  const builder = builders[buildOptions.builder ?? 'esbuild']

  rmSync(outdir, {
    recursive: true,
    force: true,
  })

  if (buildOptions.individually) {
    const handlers = parseHandlersYML(buildOptions.functions)

    await builder({
      handlers,
      build: buildOptions,
    })
  } else {
    const files = await getFiles(buildOptions.base_dir)
    const handlers = parseHandlersFiles(files)

    await builder({
      handlers,
      build: buildOptions,
    })
  }

  const handlers = readdirSync(outdir)

  if (options.staticPath) {
    for (const handler of handlers) {
      fse.copySync(
        path.resolve(process.cwd()) + `/${options.staticPath}`,
        path.resolve(process.cwd(), outdir, handler) + `/${options.staticPath}`,
        { overwrite: false })
    }
  }

  if (buildOptions.zip) {
    console.debug(`Starting lambdas compress: - ${handlers.length} function(s)`)

    const promises = []
    for (const handler of handlers) {
      const inputFolder = `${process.cwd()}/${outdir}/${handler}`
      const outZip = `${outdir}/${handler}.zip`

      const promiseResult = zipDirectory(inputFolder, outZip)
      promises.push(promiseResult)
    }

    await Promise.all(promises)
  }

  console.info('Build finished')
}

buildRun({
  base_dir: process.env.INPUT_BASE_DIR,
  builder: process.env.INPUT_BUILDER,
  bundle: process.env.INPUT_BUNDLE === 'true',
  external: process.env.INPUT_EXTERNAL ? JSON.parse(process.env.INPUT_EXTERNAL) : ['aws-sdk'],
  functions: process.env.INPUT_FUNCTIONS,
  individually: process.env.INPUT_INDIVIDUALLY === 'true',
  minify: process.env.INPUT_MINIFY === 'true',
  outdir: process.env.INPUT_OUTDIR,
  sourcemap: process.env.INPUT_SOURCEMAP === 'true',
  three_shaking: process.env.INPUT_THREE_SHAKING === 'true',
  zip: process.env.INPUT_ZIP === 'true',
  loader: process.env.INPUT_LOADER ? JSON.parse(process.env.INPUT_LOADER) : {},
  staticPath: process.env.INPUT_STATIC_PATH,
})
