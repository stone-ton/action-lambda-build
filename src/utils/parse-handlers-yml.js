const YAML = require('yaml')
const fs = require('fs')
const path = require('path')
const { fileSync: findSync }  = require('find')

const parsePathHandler = (handler) => {
  const { dir, name } = path.parse(handler);
  const extensions = /(\/index)?\.(ts|js)/;
  const regexFileName = new RegExp(name + extensions.source, '');
  const existsFile = findSync(regexFileName, dir)?.[0]
    || findSync(extensions, path.join(dir, name))?.[0];
  if (!existsFile) throw new Error('File not Exists');

  const resultParsed = path.parse(existsFile)

  return {
    base_dir: resultParsed.dir,
    filename: resultParsed.base,
    entry_point: `${resultParsed.dir}/${resultParsed.base}`,
    output: `${resultParsed.dir}/${resultParsed.base.replace('.ts', '.js')}`,
  };
}

const parseHandlersYML = (fileHandlers) => {
  const fileYml = fs.readFileSync(path.resolve(process.cwd(), fileHandlers), 'utf8')
  const parsedYaml = YAML.parse(fileYml);

  return Object.entries(parsedYaml.functions).map(([lambdaName, functionOptions]) => {
    const parsedFunction = parsePathHandler(functionOptions.handler)
    
    return {
      lambda_name: lambdaName,
      ...parsedFunction
    }
  })
}

module.exports = parseHandlersYML