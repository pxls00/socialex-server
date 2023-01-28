const express = require("express");
const router = express.Router();
const controller = require('../controllers/comment-reply')
const authMiddleware = require("../middleware/auth");
const { check } = require('express-validator')
router.post('/:postId/:replyId', authMiddleware, controller.addReply)
router.patch('/:postId/:replyId', [authMiddleware, check("body", `Body of the comment must not be empty`).notEmpty()], controller.editReply)
router.delete('/:postId/:replyId', authMiddleware, controller.removeReply)

module.exports = router