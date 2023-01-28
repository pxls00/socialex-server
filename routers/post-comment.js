const Router = require("Express");
const router = new Router();
const controller = require('../controllers/post-comments')
const authMiddleware = require("../middleware/auth");
router.post('/:postId', authMiddleware, controller.addComment)
router.delete('/:postId/:commentId', authMiddleware, controller.removeComment)

module.exports = router