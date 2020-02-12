const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  // get the token from th header
  const token = req.header("x-auth-token");

  //Check if there is no token
  if (!token) {
    return res
      .status(401)
      .json({ msg: "no token found, authorization denied" });
  }
  try {
    //Verify the token
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is invalid" });
  }
};
