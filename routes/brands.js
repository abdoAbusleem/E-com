const router = require("express").Router();

const {
  brandList,
  getSingleBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brands");

router.get("/brands", brandList);

router.get("/detail/:id", getSingleBrand);

router.post("/create", createBrand);

router.patch("/update/:id", updateBrand);

router.delete("/delete/:id", deleteBrand);

module.exports = router;
