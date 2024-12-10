const router = require("express").Router();

const {
  productList,
  getSingleProduct,
  productCount,
  filterByCategory,
  filterProducts,
} = require("../controllers/products");

router.get("/products", productList);

router.get("/singleProduct/:id", getSingleProduct);

router.get("/counts", productCount);

router.get("/ByCategory", filterByCategory);

router.get("/search", filterProducts);

module.exports = router;
