const express = require("express");
const router = express.Router();
const controller = require('../controllers/users')
const authMiddleware = require("../middleware/auth");

router.get('/', authMiddleware, controller.getUsers)

router.get('/:userId', authMiddleware, controller.getUserById)


module.exports = router