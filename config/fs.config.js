const fs = require('fs');
const logPath='./logs/error.txt';
const logDir='./logs';
async function logError(content, api) {
    if(!fs.existsSync(logDir)){
        fs.mkdirSync(logDir);
    }
    const value = "\nError in " + await content + "\nAPI " + api + "\nTime stamp " + (new Date()).getTime() + "\n";
    if (fs.existsSync(logPath)) {
        fs.appendFileSync(logPath, value);
    }
    else {
        fs.writeFileSync(logPath, value);
    }
}

module.exports = {
    logError,
};