const {parsePathHandler} = require('./parsePathHandler')

function parseFunctionsObject(functionsObject) {
    return Object.entries(functionsObject)
      .filter(([, props]) => !(props).ignore)
      .map(([name, props]) => {
        const { folderPath, filename } = parsePathHandler(props.handler);
        return {
          name,
          filename,
          folder: folderPath,
        };
      });
  }

  module.exports = parseFunctionsObject;