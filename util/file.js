const fs = require('fs')

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            throw (err);
        }
    }) // delete
}

exports.deleteFile = deleteFile;