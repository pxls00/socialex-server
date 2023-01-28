const express = require("express");
const router = express.Router();
const controller = require('../controllers/post-likes')
const authMiddleware = require("../middleware/auth");

router.post('/:postId', authMiddleware, controller.like)
router.delete('/:postId', authMiddleware, controller.unlike)

module.exports = router