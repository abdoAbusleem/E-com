const router = require("express").Router();

const {
  categoryList,
  getSingleCategory,
} = require("../controllers/categories");

router.get("/categories", categoryList);

router.get("/:id", getSingleCategory);

module.exports = router;
