const Order = require("../models/order");
const Cart = require("../models/cart");
const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../Enums/httpStatusText");
const appError = require("../utils/appError");
const message = require("../Enums/errorMessage");
const orderStatus = require("../Enums/orderStatus");

const placeOrder = asyncWrapper(async (req, res, next) => {
  const order = await Order.findOneAndUpdate(
    { user: req.currentUser.id, status: orderStatus.pending },
    { $set: { status: orderStatus.active, activationDate: new Date() } },
    { new: true }
  );

  if (!order) {
    const error = appError.create(
      message.noProductpendingYet,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  await Cart.deleteOne({ user: req.currentUser.id });

  return res.status(201).send({ status: httpStatusText.SUCCESS });
});

const listOrder = asyncWrapper(async (req, res, next) => {
  const order = await Order.find({ user: req.currentUser.id }).populate({
    path: "items.product_id",
    select: ["productName", "images", "price", "_id"],
  });

  if (!order) {
    const error = appError.create(
      message.productNotFound,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res.status(201).send({ status: httpStatusText.SUCCESS, order });
});

module.exports = {
  placeOrder,
  listOrder,
};
