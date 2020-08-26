const bcrypt = require("bcrypt");

async function generateSaltAndHash(password) {
  try {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  } catch (err) {
    console.error(err);
  }
}

function verifyPassword(password, hash, isVerified) {
  bcrypt.compare(password, hash, function (err, bool) {
    isVerified(err, bool);
  });
}

module.exports = {
  verifyPassword,
  generateSaltAndHash,
};
