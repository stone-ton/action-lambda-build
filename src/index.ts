#!/usr/bin/env node

// @ts-ignore
import ncc from '@vercel/ncc';
import Zip from 'adm-zip';
import bytes from 'bytes';
import chalk from 'chalk';
import { Command } from 'commander';
import Del from 'del';
import findPkg from 'find';
import fs from 'fs';
import log from 'log-update';
import mkdirp from 'mkdirp';
import path from 'path';
import YAML from 'yaml';

const { fileSync: findSync } = findPkg;

const options = {
  file: 'functions.yml',
  output: 'build',
  minify: true,
  sourceMap: true,
  individually: true,
  zip: true,
  target: 'es2019'
};

const fileYml = fs.readFileSync(
  path.resolve(process.cwd(), options.file),
  'utf8',
);

const parsedYaml = YAML.parse(fileYml);

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

function parseFunctionsObject(functionsObject: any) {
  return Object.entries(functionsObject)
    .filter(([, props]) => !(props as any).ignore)
    .map(([name, props]: any) => {
      const { folderPath, filename } = parsePathHandler(props.handler);
      return {
        name,
        filename,
        folder: folderPath,
      };
    });
}

async function buildFiles() {
  const files = parseFunctionsObject(parsedYaml.functions);

  mkdirp.sync(path.resolve(process.cwd(), options.output));

  Del.sync(options.output, { cwd: process.cwd() });

  mkdirp.sync(options.output);


  // eslint-disable-next-line no-restricted-syntax
  for await (const file of files) {
    log(file.name, chalk.black.bgYellow('Start Build'));
    const build = await ncc(
      path.resolve(process.cwd(), file.folder, file.filename),
      {
        externals: ['aws-sdk'],
        // provide a custom cache path or disable caching
        cache: false,
        // externals to leave as requires of the build
        // directory outside of which never to emit assets
        filterAssetBase: process.cwd(), // default
        minify: options.minify, // default
        sourceMap: options.sourceMap, // default
        assetBuilds: false, // default
        sourceMapBasePrefix: '../', // default treats sources as output-relative
        // when outputting a sourcemap, automatically include
        // source-map-support in the output file (increases output by 32kB).
        sourceMapRegister: true, // default
        watch: false, // default
        license: '', // default does not generate a license file
        v8cache: false, // default
        quiet: true, // default
        debugLog: false, // default
        target: options.target,
      },
    );
    log(JSON.stringify(build.assets[Object.keys(build.assets)[1]].source.data))
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
    if(options.sourceMap) {
      fs.writeFileSync(outputPathWithFilename + '.map', build.assets[Object.keys(build.assets)[0]]?.source)
    }
    log(
      file.name,
      chalk.black.bgBlue(
        'Size',
        bytes(fs.statSync(outputPathWithFilename).size),
      ),
    );
    log.done();

    if (options.zip && options.individually) {
      const zip = new Zip();

      zip.addLocalFolder(path.resolve(options.output, file.name));
      await zip.writeZipPromise(
        path.resolve(options.output, `${file.name}.zip`),
      );

      log(
        file.name,
        chalk.black.bgBlueBright(
          'Size zipped',
          bytes(fs.statSync(path.resolve(options.output, `${file.name}.zip`)).size),
        ),
      );
      log.done();
    }
  }
}

buildFiles().then(async () => {
  if (options.zip && !options.individually) {
    const zip = new Zip();
    zip.addLocalFolder(path.resolve(options.output));
    const outputZip = path.resolve(options.output, 'latest.zip');
    await zip.writeZipPromise(outputZip);
    log(
      'latest.zip',
      chalk.black.bgBlueBright(
        'Size',
        bytes(fs.statSync(outputZip).size),
      ),
    );
    log.done();
  }
});