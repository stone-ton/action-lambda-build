// const log = require('log-update');
const path = require('path');
const YAML = require('yaml');
const parseFunctionsObject = require('./utils/parseFunctionsObject');
const buildFiles = require('./utils/buildFiles');
const convertFilesToZip = require('./utils/convertFilesToZip');
const chalk = require('chalk');
const fs = require('fs');

const bytes = require('bytes');


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
  sourceMap: false,
  individually: true,
  zip: true,
  target: 'es2020'
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
    // log.done();
  }
});
