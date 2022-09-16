import path from 'path';
import findPkg from 'find';

const { fileSync: findSync } = findPkg;


function parsePathHandler(handler: string) {
  const { dir, name } = path.parse(handler);
  const extensions = /(\/index)?\.(ts|js)/;
  const regexFileName = new RegExp(name + extensions.source, '');
  const existsFile = findSync(regexFileName, dir)?.[0]
    || findSync(extensions, path.join(dir, name))?.[0];
  if (!existsFile) throw new Error('File not Exists');

  return {
    filename: path.parse(existsFile).base,
    folderPath: path.parse(existsFile).dir,
  };
}

  export {parsePathHandler}