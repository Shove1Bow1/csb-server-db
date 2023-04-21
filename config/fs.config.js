const fs = require('fs');

function logError(content, api) {
    const value = "\n\nError in " + content + "\napi " + api + "\nTime stamp " + (new Date()).getTime() + "\n\n";
    if (fs.existsSync('error.txt')) {
        fs.appendFile('error.txt', value, (error => {
            if (err) {
                console.log(error);
            }
        }));
    }
    else {
        fs.openSync('error.txt',2);
        fs.writeFile('error.txt', value, (error => {
            if (error) {
                console.log(error);
            }
        }));
    }

}

module.exports = {
    logError,
}