const mkdirp  = require('mkdirp');
const path  = require('path');
const Del  = require('del');
// const log  = require('log-update');
const chalk  = require('chalk');
// @ts-ignore
const ncc  = require('@vercel/ncc');
const fs  = require('fs');
const Zip  = require('adm-zip');
const bytes  = require('bytes');



async function buildFiles(files, options) {  
    mkdirp.sync(path.resolve(process.cwd(), options.output));
  
    Del.sync(options.output, { cwd: process.cwd() });
  
    mkdirp.sync(options.output);
  
    // eslint-disable-next-line no-restricted-syntax
    for await (const file of files) {
      // log(file.name, chalk.black.bgYellow('Start Build'));
      const build = await ncc(
        path.resolve(process.cwd(), file.folder, file.filename),
        {
          externals: ['aws-sdk'],// provide a custom cache path or disable caching
          cache: false,
          filterAssetBase: process.cwd(), // default
          minify: options.minify, // default
          sourceMap: options.sourceMap, // default
          assetBuilds: false, // default
          sourceMapBasePrefix: '../', // default treats sources as output-relative
          sourceMapRegister: true, // default
          watch: false, // default
          license: '', // default does not generate a license file
          v8cache: false, // default
          quiet: true, // default
          debugLog: false, // default
          target: options.target,
        },
      );
      
      const outputFolderArgs = [process.cwd(), options.output, file.folder];
  
      if (options.individually) outputFolderArgs.splice(2, 0, file.name);
  
      const outputFolder = path.resolve(...outputFolderArgs);
      const outputFilename = `${path.parse(file.filename).name}.js`;
  
      mkdirp.sync(outputFolder);
  
      const outputPathWithFilename = path.resolve(outputFolder, outputFilename);
  
      fs.writeFileSync(outputPathWithFilename, build.code);
      if (options.sourceMap) {
        fs.writeFileSync(`${outputPathWithFilename}.map`, build.assets[Object.keys(build.assets)[0]]?.source);
      }

      if (options.zip && options.individually) {
        const zip = new Zip();
  
        zip.addLocalFolder(path.resolve(options.output, file.name));
        await zip.writeZipPromise(
          path.resolve(options.output, `${file.name}.zip`),
        );
      }
    }
  }

  module.exports = buildFiles;