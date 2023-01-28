const Router = require("Express");
const router = new Router();
const controller = require('../controllers/follow')
const authMiddleware = require('../middleware/auth')

router.post('/:userId', authMiddleware, controller.addFollowing)
router.delete('/:userId', authMiddleware, controller.cancelFollowing)

module.exports = router