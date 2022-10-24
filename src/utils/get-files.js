const { stat, readdir } = require('fs/promises')
const { resolve, relative } = require('path')

async function getFiles (dir) {
  const subdirs = await readdir(dir)
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir)
    return (await stat(res)).isDirectory() ? getFiles(res) : relative(process.cwd(), res)
  }))
  return files.reduce((a, f) => a.concat(f), [])
}

module.exports = getFiles
