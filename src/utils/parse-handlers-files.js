const { fileSync: findSync } = require('find')
const path = require('path')

const parsePathHandler = (handler) => {
  const inputExtensions = process.env.INPUT_EXTENSIONS

  const allExtensions = [
    'ts',
    'js',
  ]

  if (inputExtensions) {
    allExtensions.push(...inputExtensions.split(','))
  }

  const extensions = allExtensions.join('|')

  const { dir, name } = path.parse(handler)
  const extensionsRegex = new RegExp(`(/index)?\\.(${extensions})`)
  const regexFileName = new RegExp(name + extensionsRegex.source, '')
  const existsFile = findSync(regexFileName, dir)?.[0]
    || findSync(extensionsRegex, path.join(dir, name))?.[0]
  if (!existsFile) throw new Error('File not Exists')

  const resultParsed = path.parse(existsFile)

  return {
    base_dir: resultParsed.dir,
    filename: resultParsed.base,
    entry_point: `${resultParsed.dir}/${resultParsed.base}`,
    output: `${resultParsed.dir}/${resultParsed.base.replace('.ts', '.js')}`,
  }
}

const parseHandlersFiles = (files) => {
  const filteredHandlers = files.filter(file => !file.match('.test.*$'))

  return filteredHandlers.map(parsePathHandler)
}

module.exports = parseHandlersFiles
