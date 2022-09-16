import {parsePathHandler} from './parsePathHandler'

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

  export {parseFunctionsObject}