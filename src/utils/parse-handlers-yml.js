const YAML = require('yaml')
const fs = require('fs')
const path = require('path')

/**
 * @param {string} handler
 */
const parsePathHandler = (handler) => {
  const paths = handler.split('.')
  paths.pop()
  const path = paths.join('.')

  const isTS = fs.existsSync(`${path}.ts`)
  const isJS = fs.existsSync(`${path}.js`)

  if (!isJS && !isTS) {
    throw new Error(`${handler} not exist`)
  }

  return {
    entry_point: `${path}${isTS ? '.ts' : '.js'}`,
    output: path,
  }
}

const parseHandlersYML = (fileHandlers) => {
  const fileYml = fs.readFileSync(path.resolve(process.cwd(), fileHandlers), 'utf8')
  const parsedYaml = YAML.parse(fileYml)

  return Object.entries(parsedYaml.functions).map(([lambdaName, functionOptions]) => {
    const parsedFunction = parsePathHandler(functionOptions.handler)

    return {
      lambda_name: lambdaName,
      ...parsedFunction,
    }
  })
}

module.exports = parseHandlersYML
