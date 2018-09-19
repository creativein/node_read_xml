const fs = require('fs');
const path = require('path');
const xmlReader = require('read-xml');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const winston = require('winston');
const SCRIPT_PATH = process.env.SCRIPT_PATH || path.resolve(__dirname);
const XML_FOLDER_WLF = process.env.WLF_XML_FOLDER || path.resolve('../word_letter_focus');
const XML_FOLDER_PRP = process.env.PRP_XML_FOLDER || path.resolve('../proof_reading_pro');
const XML_MARVILLAS_FOLDER_PRP = process.env.WLF_XML_MARVILLAS_FOLDER || path.resolve('D:/svn/MHE_Marvillas_XML/Maravillas_XML/proof_reading_pro');
const XML_MARVILLAS_FOLDER_WLF = process.env.PRP_XML_MARVILLAS_FOLDER || path.resolve('D:/svn/MHE_Marvillas_XML/Maravillas_XML/word_letter_focus');

console.log('Current Directory: ', SCRIPT_PATH);
console.log('WLF Directory: ', XML_FOLDER_WLF);
console.log('PRP Directory: ', XML_FOLDER_PRP);


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'search.log', level: 'info' })
    ]
  });

const readXML = (xmlFile) => {
    const decodedXMLStream = fs.createReadStream(xmlFile).pipe(xmlReader.createStream());

    decodedXMLStream.on('encodingDetected', (encoding) => {
        console.log('Encoding:', encoding);
    });

    decodedXMLStream.on('data', (xmlStr) => {
        searchNode('', xmlStr, xmlFile);
    });
}

const listFiles = (dirPath) => {
    console.log('Looking into directory: ', dirPath);
    fs.readdir(dirPath, (error, files) => {
        if (error) {
            console.log('Error')
        } else {
            for (let i = 0; i < files.length; i++) {
                const file = path.join(dirPath, files[i]);
                console.log('Reading XML File : ', file)
                readXML(file);
            }
        }
    })
}

const searchNode = (regEx = '', xmlStr, xmlFile) => {
    const dom = new JSDOM(xmlStr);
    regEx = /((?:“).*(?:”))/;
    console.log('Checking FILE: ', xmlFile);
    // Replace node name here
    const nodeList = dom.window.document.querySelectorAll('text');
    const found = findRegexMatch(regEx, nodeList);
    (found) ? logger.info(`File: ${path.basename(xmlFile)}`) : '';
}

const findRegexMatch = (regEx, nodeList) => {
    let found = false;
    nodeList.forEach(nodeItem => {
       const match =  nodeItem.textContent.match(regEx);
       if(match) {
           found = true;
           return found;
       }
    })
    return found;
}


// listFiles(XML_MARVILLAS_FOLDER_PRP);
// listFiles(XML_MARVILLAS_FOLDER_WLF);
// listFiles(XML_FOLDER_PRP);
listFiles(XML_FOLDER_WLF);