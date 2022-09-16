const Zip = require('adm-zip');
const path = require('path');




async function convertFilesToZip(output, zipName) {
    const zip = new Zip();
    zip.addLocalFolder(path.resolve(output));
    const outputZip = path.resolve(output, `${zipName}.zip`);
    await zip.writeZipPromise(outputZip);

    return outputZip;
}

module.exports = convertFilesToZip;
