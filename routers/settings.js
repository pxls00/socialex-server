const Router = require("Express");
const router = new Router();
const controller = require("../controllers/settings");
const authMiddleware = require("../middleware/auth");
const { check } = require("express-validator");
const multer = require('multer')
const upload = multer({
  dest: "../uploads/"
})

router.get("/", authMiddleware, controller.getSettings);
router.patch(
  "/",
  [
    authMiddleware,
    check("name", `Name of the user must be more 5 and lesser 30`).isLength({
      min: 5,
      max: 30,
    })],
  controller.updateSettings
);
// router.patch(
//   "/reset-password",
//   [
//     authMiddleware,
//     check(
//       "currentPassword",
//       "Password of user should be more 8 and lesser 16"
//     ).isLength({ min: 8, max: 16 }),
//     check(
//       "newPassword",
//       "Password of user should be more 8 and lesser 16"
//     ).isLength({ min: 8, max: 16 }),
//   ],
//   controller.resetPassword
// );
router.delete("/", authMiddleware, controller.deleteAccount);

module.exports = router;
