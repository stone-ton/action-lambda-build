import Zip from 'adm-zip';
import path from 'path';




async function convertFilesToZip(output: string, zipName: string) {
    const zip = new Zip();
    zip.addLocalFolder(path.resolve(output));
    const outputZip = path.resolve(output, `${zipName}.zip`);
    await zip.writeZipPromise(outputZip);

    return outputZip;
}

export {convertFilesToZip}
