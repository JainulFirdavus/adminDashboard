
const multer = require('multer');
const mkdirp = require('mkdirp');
// const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
exports.commonUpload = function (destinationPath) {
    // let _startIngTime = Date.now();
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, destinationPath);
        },
        filename: function (req, file, callback) {
            /*  fs.readFile(destinationPath + file.originalname, function (err, res) {
               if (!err) {
                 var dynamicTime = Date.now().toString();
                 callback(null, dynamicTime + file.originalname);
               } else {
                 var dynamicTime = '';
                 callback(null, '' + file.originalname);
               }
             }); */
            var file_full_name = file.originalname.split('.');
            var file_name = file_full_name[0];
            var file_ext = file_full_name[1];

            if (fs.existsSync(destinationPath + file.originalname)) {
                var time = Date.now().toString();
                callback(null, file_name + '-' + time + '.' + file_ext);
            } else {
                callback(null, file.originalname);
            }
        }
    });

    var uploaded = multer({ storage: storage }); /**----{limits : {fieldNameSize : 100}}---*/

    return uploaded;
}
