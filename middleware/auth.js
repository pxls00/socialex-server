const jwt = require("jsonwebtoken");
const config = require("../lib/config");
const Users = require('../models/Users')

module.exports = async function (req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedData = jwt.verify(token, "SECRET_KEY");
    const user = await Users.findById(decodedData.id)
    if(user.token.token === token) {
      req.user = decodedData;   
      next()
    } else if(user.token.token !== token || !token){
      return res.status(403).json({ message: "User unauthorized" })
    } else if(((Date.now() - parseInt(user.token.createdAt)) / 1000) >= 3600) {
      await Users.findByIdAndUpdate(user._id, {token: {}})
    }
  } catch (error) {
    console.error(error);
    res.status(403).json({message: "User unauthorized"})
  }
};
