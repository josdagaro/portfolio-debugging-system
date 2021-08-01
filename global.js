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
      name: path.basename(name, '.pdf'),
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

exports.deleteFiles = (scope, files) => {
  const pdfsDirPath = path.join(__dirname, config.defaults.downloadsPath + `/${scope}`);
  console.log('[INFO]: Cleaning PDFs');

  for (let i = 0; i < files.length; i++) {
    fs.unlink(pdfsDirPath + `/${files[i]}${files[i].includes('ReporteDePago.Por.Cotizantes') ? '' : '.pdf'}`, function (err) {
      if (err) {
        // When it fails, it tries again assuming the file type is a PDF (before it was a ZIP with the same name)
        fs.unlink(pdfsDirPath + `/${files[i]}.pdf`, function (err2) {
          if (err2) {
            throw err2;
          }
        });
      }
    });
  }
}
