const router = require("express").Router();

const {
  createCart,
  viewCart,
  updateCart,
  deleteFromCart,
  deleteCart,
} = require("../controllers/cart");

router.post("/addtocart", createCart);
router.get("/items", viewCart);
router.patch("/update", updateCart);
router.delete("/deleteitem", deleteFromCart);
router.delete("/deletecart", deleteCart);

module.exports = router;
