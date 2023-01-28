const express = require("express");
const router = express.Router();
const controller = require('../controllers/follow')
const authMiddleware = require('../middleware/auth')

router.post('/:userId', authMiddleware, controller.addFollowing)
router.delete('/:userId', authMiddleware, controller.cancelFollowing)

module.exports = router