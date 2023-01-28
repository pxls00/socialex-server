const Router = require("Express");
const router = new Router();
const controller = require("../controllers/auth");
const { check } = require("express-validator");
const authMiddleware = require("../middleware/auth");


router.post(
  "/register", [
    check("name", `Name of the user must be more 5 and lesser 30`).isLength({ min: 5, max: 30}),
    check("password", "Password of user should be more 8 and lesser 16").isLength({ min: 8, max: 16 }),
    check("email", "Email must contain @").isEmail(),
  ], controller.registration
);
router.post("/login", controller.login);
router.delete('/logout', authMiddleware, controller.logout)



module.exports = router;
