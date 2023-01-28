const Router = require("Express");
const router = new Router();
const controller = require('../controllers/posts')
const authMiddleware = require("../middleware/auth");

router.get('/', authMiddleware, controller.getPosts)
router.get('/:postId', authMiddleware, controller.getPostById)
router.post('/', authMiddleware, controller.addPost)
router.patch('/:postId', authMiddleware, controller.editPost)
router.delete('/:postId', authMiddleware, controller.deletePost)

module.exports = router