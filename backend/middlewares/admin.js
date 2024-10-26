const jwt = require("jsonwebtoken");
const { JWT_ADMIN_SECRET } = require("../config");

function adminMiddleware(req, res, next) {
  const token = req.headers.token;
  const decodedToken = jwt.verify(token, JWT_ADMIN_SECRET);

  if (decodedToken) {
    req.adminId = decodedToken.adminId;
    next();
  } else {
    res.status(403).json({
      message: "invalid creds",
    });
  }
}

module.exports = {
    adminMiddleware
}