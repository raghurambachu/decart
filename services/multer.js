const multer = require("multer");
const { format } = require("morgan");
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();
const path = require("path");

const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).array("image");

const dataUris = (req) => {
  const files = req.files;
  let duris = [];
  for (let i = 0; i < req.files.length; i++) {
    const arg = files[i].originalname.toString();

    duris.push(parser.format(path.extname(arg), files[i].buffer));
  }
  return duris;
};

module.exports = { multerUploads, dataUris };
