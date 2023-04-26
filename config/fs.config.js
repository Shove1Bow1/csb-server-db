const fs = require('fs');
const logPath='../logs/error.txt';
const logDir='../logs';
function logError(content, api) {
    if(!fs.existsSync(logDir)){
        fs.mkdirSync(logDir);
    }
    const value = "\n\nError in " + content + "\nAPI " + api + "\nTime stamp " + (new Date()).getTime() + "\n\n";
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