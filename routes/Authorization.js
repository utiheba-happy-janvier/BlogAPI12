const jwt = require("jsonwebtoken");
const user = require("./model/User");
const dotenv = require("dotenv");

dotenv.config();

async function Authorization(req, res, next) {
  let token;
  try {

    if(!req.headers.authorization) {
        return res.status(401).json({
            message:"Login first to create a blog",
        })
    }
    if (
      req.headers.authorization !== "undefined" &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return res.status(401).json({ message: "Access denied" });

    const verified = await jwt.verify(token, process.env.TOKEN_SECRET);
    const userData = await user.findById({ _id: verified.id });
    if (!userData) {
      return res.status(401).json({
        message: "Session expired please login in again",
      });
    }
    req.user = userData;
    next();
  } catch (error) {
    res.status(400).json({
      status: "failed",
      error: error.message,
    });
  }
}

module.exports = Authorization;
