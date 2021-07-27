const fs = require("fs");
const path = require("path");
const config = require('./config');

exports.filterFiles = (files) => {
  const blackList = [
    '.DS_Store',
    '.gitkeep',
  ];

  let filteredList = [];

  for (let i = 0; i < files.length; i++) {
    let itIsInBlackList = false

    for (let j = 0; j < blackList.length; j++) {
      if (blackList[j] == files[i].name) {
        itIsInBlackList = true;
        break;
      }
    }

    if (!itIsInBlackList) {
      filteredList.push(files[i]);
    }
  }

  return filteredList;
}

exports.refreshFiles = (scope) => {
  const pdfsDirPath = path.join(__dirname, config.defaults.downloadsPath + `/${scope}`);

  return fs.readdirSync(pdfsDirPath).map(name => {
    return {
      name: path.basename(name, ".pdf"),
      url: `/${scope}/${name}`
    };
  });
}

exports.extractFilesNames = (files) => {
  let filesNames = [];

  for (let i = 0; i < files.length; i++) {
    filesNames.push(files[i].name);
  }

  return filesNames;
}
