
import path from 'path';
import YAML from 'yaml';
import {parseFunctionsObject} from './utils/parseFunctionsObject';
import {buildFiles} from './utils/buildFiles';
import {convertFilesToZip} from './utils/convertFilesToZip';
import fs from 'fs';
import log from 'log-update';

// import chalk from 'chalk';

// import bytes from 'bytes';


// program
//   .option('-o, --output <path>', 'output path', 'build')
//   .option('-f, --file <path>', 'file path')
//   .option('-i, --individually', 'build individually lambdas')
//   .option('-z, --zip', 'zip build')
//   .option('-s, --source-map', 'enable source map file')
//   .option('-m, --minify', 'enable minify file')
//   .option('-t, --target <es>', 'ES version target', 'es2019');

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
const files = parseFunctionsObject(parsedYaml.functions);


buildFiles(files, options).then(async () => {
  if (options.zip && !options.individually) {
    await convertFilesToZip(options.output, 'latest')

    console.log('ok')

    // log(
    //   'latest.zip',
    //   chalk.black.bgBlueBright(
    //     'Size',
    //     bytes(fs.statSync(outputZip).size),
    //   ),
    // );
    log.done();
  }
});
