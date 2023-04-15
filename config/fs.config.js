const fs = require('fs');

function logError(content, api) {
    const value = "Error in " + content + "\napi " + api + "\nTime stamp " + (new Date()).getTime() + "\n\n";
    if (fs.existsSync('/logs/error.txt')) {
        fs.appendFile('/logs/error.txt', value, (error => {
            if (err) {
                console.log(error);
            }
        }));
    }
    else
    fs.writeFile('/logs/error.txt', value, (error => {
        if (err) {
            console.log(error);
        }
    }));
}

module.exports = {
    logError,
}