const express = require("express");
const router = express.Router();
const controller = require('../controllers/save-posts')
const authMiddleware = require("../middleware/auth");

router.get('/', authMiddleware, controller.getSavedPosts)
router.post('/:postId', authMiddleware, controller.savePost)
router.delete('/:postId', authMiddleware, controller.removeSavedPost)
module.exports = router