const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage();
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser()

const multerUploadsSingle = multer(
    {
        storage,
        fileFilter: function(req,file,cb){
            const fileTypes = /jpeg|jpg|png|webp/;
            const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
            if(extName){
                return cb(null,true);
            } 
            cb("Error: File upload only supports the following filetypes - " + filetypes)
    }
}).single("banner")

const dataUri = req => parser.format(path.extname(req.file.originalname).toString(),req.file.buffer);

module.exports = {
    multerUploadsSingle,
    dataUri
}