import mkdirp  from 'mkdirp';
import path  from 'path';
import Del  from 'del';
import log  from 'log-update';
import chalk  from 'chalk';
// @ts-ignore
import ncc  from '@vercel/ncc';
import fs  from 'fs';
import Zip  from 'adm-zip';
// import bytes  from 'bytes';



async function buildFiles(files: any, options: any) {  
    mkdirp.sync(path.resolve(process.cwd(), options.output));
  
    Del.sync(options.output, { cwd: process.cwd() });
  
    mkdirp.sync(options.output);
  
    // eslint-disable-next-line no-restricted-syntax
    for await (const file of files) {
      log(file.name, chalk.black.bgYellow('Start Build'));
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
      
      log(JSON.stringify(build.assets[Object.keys(build.assets)[1]].source.data));
      log.done();
  
      log(file.name, chalk.black.bgGreen('Finish Build'));
      log.done();
  
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
      // log(
      //   file.name,
      //   chalk.black.bgBlue(
      //     'Size',
      //     bytes(fs.statSync(outputPathWithFilename).size),
      //   ),
      // );
      log.done();
  
      if (options.zip && options.individually) {
        const zip = new Zip();
  
        zip.addLocalFolder(path.resolve(options.output, file.name));
        await zip.writeZipPromise(
          path.resolve(options.output, `${file.name}.zip`),
        );
  
        // log(
        //   file.name,
        //   chalk.black.bgBlueBright(
        //     'Size zipped',
        //     bytes(fs.statSync(path.resolve(options.output, `${file.name}.zip`)).size),
        //   ),
        // );
        log.done();
      }
    }
  }

  export {buildFiles}