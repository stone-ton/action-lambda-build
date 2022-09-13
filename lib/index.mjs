#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
// @ts-ignore
import ncc from '@vercel/ncc';
import Zip from 'adm-zip';
import bytes from 'bytes';
import chalk from 'chalk';
import Del from 'del';
import findPkg from 'find';
import fs from 'fs';
import log from 'log-update';
import mkdirp from 'mkdirp';
import path from 'path';
import YAML from 'yaml';
const { fileSync: findSync } = findPkg;
// const program = new Command();
// program
//   .option('-o, --output <path>', 'output path', 'build')
//   .option('-f, --file <path>', 'file path')
//   .option('-i, --individually', 'build individually lambdas')
//   .option('-z, --zip', 'zip build')
//   .option('-s, --source-map', 'enable source map file')
//   .option('-m, --minify', 'enable minify file')
//   .option('-t, --target <es>', 'ES version target', 'es2019');
// program.parse();
// const options = program.opts();
const options = {
    file: 'functions.yml',
    output: 'build',
    minify: true,
    sourceMap: true,
    individually: true,
    zip: true,
    target: 'es2019'
};
const fileYml = fs.readFileSync(path.resolve(process.cwd(), options.file), 'utf8');
const parsedYaml = YAML.parse(fileYml);
function parsePathHandler(handler) {
    var _a, _b;
    const { dir, name } = path.parse(handler);
    const extensions = /(\/index)?\.(ts|js)/;
    const regexFileName = new RegExp(name + extensions.source, '');
    const existsFile = ((_a = findSync(regexFileName, dir)) === null || _a === void 0 ? void 0 : _a[0])
        || ((_b = findSync(extensions, path.join(dir, name))) === null || _b === void 0 ? void 0 : _b[0]);
    if (!existsFile)
        throw new Error('File not Exists');
    return {
        filename: path.parse(existsFile).base,
        folderPath: path.parse(existsFile).dir,
    };
}
function parseFunctionsObject(functionsObject) {
    return Object.entries(functionsObject)
        .filter(([, props]) => !props.ignore)
        .map(([name, props]) => {
        const { folderPath, filename } = parsePathHandler(props.handler);
        return {
            name,
            filename,
            folder: folderPath,
        };
    });
}
function buildFiles() {
    var e_1, _a;
    var _b;
    return __awaiter(this, void 0, void 0, function* () {
        const files = parseFunctionsObject(parsedYaml.functions);
        mkdirp.sync(path.resolve(process.cwd(), options.output));
        Del.sync(options.output, { cwd: process.cwd() });
        mkdirp.sync(options.output);
        try {
            // eslint-disable-next-line no-restricted-syntax
            for (var files_1 = __asyncValues(files), files_1_1; files_1_1 = yield files_1.next(), !files_1_1.done;) {
                const file = files_1_1.value;
                log(file.name, chalk.black.bgYellow('Start Build'));
                const build = yield ncc(path.resolve(process.cwd(), file.folder, file.filename), {
                    externals: ['aws-sdk'],
                    // provide a custom cache path or disable caching
                    cache: false,
                    // externals to leave as requires of the build
                    // directory outside of which never to emit assets
                    filterAssetBase: process.cwd(),
                    minify: options.minify,
                    sourceMap: options.sourceMap,
                    assetBuilds: false,
                    sourceMapBasePrefix: '../',
                    // when outputting a sourcemap, automatically include
                    // source-map-support in the output file (increases output by 32kB).
                    sourceMapRegister: true,
                    watch: false,
                    license: '',
                    v8cache: false,
                    quiet: true,
                    debugLog: false,
                    target: options.target,
                });
                log(JSON.stringify(build.assets[Object.keys(build.assets)[1]].source.data));
                log.done();
                log(file.name, chalk.black.bgGreen('Finish Build'));
                log.done();
                const outputFolderArgs = [process.cwd(), options.output, file.folder];
                if (options.individually)
                    outputFolderArgs.splice(2, 0, file.name);
                const outputFolder = path.resolve(...outputFolderArgs);
                const outputFilename = `${path.parse(file.filename).name}.js`;
                mkdirp.sync(outputFolder);
                const outputPathWithFilename = path.resolve(outputFolder, outputFilename);
                fs.writeFileSync(outputPathWithFilename, build.code);
                if (options.sourceMap) {
                    fs.writeFileSync(outputPathWithFilename + '.map', (_b = build.assets[Object.keys(build.assets)[0]]) === null || _b === void 0 ? void 0 : _b.source);
                }
                log(file.name, chalk.black.bgBlue('Size', bytes(fs.statSync(outputPathWithFilename).size)));
                log.done();
                if (options.zip && options.individually) {
                    const zip = new Zip();
                    zip.addLocalFolder(path.resolve(options.output, file.name));
                    yield zip.writeZipPromise(path.resolve(options.output, `${file.name}.zip`));
                    log(file.name, chalk.black.bgBlueBright('Size zipped', bytes(fs.statSync(path.resolve(options.output, `${file.name}.zip`)).size)));
                    log.done();
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (files_1_1 && !files_1_1.done && (_a = files_1.return)) yield _a.call(files_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
buildFiles().then(() => __awaiter(void 0, void 0, void 0, function* () {
    if (options.zip && !options.individually) {
        const zip = new Zip();
        zip.addLocalFolder(path.resolve(options.output));
        const outputZip = path.resolve(options.output, 'latest.zip');
        yield zip.writeZipPromise(outputZip);
        log('latest.zip', chalk.black.bgBlueBright('Size', bytes(fs.statSync(outputZip).size)));
        log.done();
    }
}));
