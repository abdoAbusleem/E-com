const router = require("express").Router();
const { addRating, updateRate } = require("../controllers/rating");

router.post("/createrate", addRating);
router.delete("/delete");
router.patch("/update", updateRate);

module.exports = router;
