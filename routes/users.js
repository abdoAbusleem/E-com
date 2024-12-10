const router = require("express").Router();
const {
  becomeAseller,
  register,
  login,
  forgetPassword,
  resetPassword,
  logOut,
} = require("../controllers/users");
const verfiyToken = require("../middleware/verfiyToken");
const passport = require("passport");

router.post("/register", register);
router.post("/becomeseller", verfiyToken, becomeAseller);
router.post("/login", login);
router.post("/forgetpassword", forgetPassword);
router.post("/resetpassword", resetPassword);
router.post("/logout", logOut);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/cb", passport.authenticate("google"), (req, res) => {
  res.send("login");
});

module.exports = router;
