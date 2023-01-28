const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../lib/config");
const { validationResult } = require("express-validator");

const generateAccessToken = (id, name, email) => {
  const payload = {
    id,
    name,
    email,
  };
  return jwt.sign(payload, config.secret, { expiresIn: "1h" });
};

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty) {
        return res.status(400).json(errors);
      }
      const { email, password, name } = req.body;
      const isExists = await User.findOne({ email });
      if (isExists && Object.keys(isExists)) {
        return res
          .status(409)
          .json({ message: "User with this email already exists" });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const user = new User({ email, name, password: hashPassword });
      await user.save();
      return res
        .status(201)
        .json({ message: "User has been created successfully" });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "Registration error", e });
    }
  }
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ message: `User with ${email} is not defined` });
      }
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res
          .status(400)
          .json({ message: `User with ${password} is not defined` });
      }
      const token = generateAccessToken(user._id, user.name, user.email);

      await User.findByIdAndUpdate(user._id, {
        token: {
          token,
          createdAt: Date.now().toString(),
        },
      });
      return res.json({ token });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: "Login error", e });
    }
  }

  async logout(req, res) {
    try {
      await User.findByIdAndUpdate(req.user.id, { token: {} });
      res.json({ message: "logged out" });
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = new authController();
