const { fileSync: findSync } = require('find')
const path = require('path')

const parsePathHandler = (handler) => {
  const moreExtensions = process.env.INPUT_EXTENSIONS

  const allExtensions = [
    'ts',
    'js',
  ]

  if (process.env.INPUT_EXTENSIONS) {
    allExtensions.push(...moreExtensions.split(','))
  }

  const { dir, name } = path.parse(handler)
  const extensions = new RegExp(`(/index)?\\.(${allExtensions.join('|')})`)
  const regexFileName = new RegExp(name + extensions.source, '')
  const existsFile = findSync(regexFileName, dir)?.[0]
    || findSync(extensions, path.join(dir, name))?.[0]
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
