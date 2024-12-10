const router = require("express").Router();
const { placeOrder, listOrder } = require("../controllers/order");

router.post("/order", placeOrder);
router.get("/list", listOrder);

module.exports = router;
