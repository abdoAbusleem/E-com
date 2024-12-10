const Cart = require("../models/cart");
const Order = require("../models/order");
const Product = require("../models/product");
const orderStatus = require("../Enums/orderStatus");
const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../Enums/httpStatusText");
const appError = require("../utils/appError");
const message = require("../Enums/errorMessage");
const { createOrder } = require("../services/createOrder");
const { calculateTotalPrice } = require("../services/calculateTotalPrice");
const { sendNotification } = require("../services/sendingEmails");

const createCart = asyncWrapper(async (req, res, next) => {
  const { product_id } = req.body;
  const user = req.currentUser.id;

  const product = await Product.findById(product_id);

  // Find the cart for the current user
  let cart = await Cart.findOne({ user });

  if (cart) {
    // Check if the product already exists in the cart
    const productIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === product_id
    );

    if (productIndex > -1) {
      // If it exists, increase the quantity
      cart.items[productIndex].quantity += 1;
    } else {
      // If it doesn't exist, add the new product
      cart.items.push({ product_id });
    }
  } else {
    // If no cart exists, create a new one
    cart = new Cart({
      user: req.currentUser.id,
      items: [{ product_id }],
    });
  }

  cart.totalPrice = await calculateTotalPrice(cart, product);
  await cart.save();

  await createOrder(user, cart);
  sendNotification(
    "abdoabusleem232@gmail.com",
    product,
    req.currentUser.firstName
  );

  return res.status(201).send({ status: httpStatusText.SUCCESS });
});

const viewCart = asyncWrapper(async (req, res, next) => {
  const cart = await Cart.find({ user: req.currentUser.id }).populate({
    path: "items.product_id",
    select: ["productName", "images", "price", "_id"],
  });
  if (cart.length === 0) {
    const error = appError.create(
      message.noProductYet,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }
  return res.status(200).json({ status: httpStatusText.SUCCESS, cart });
});

const updateCart = asyncWrapper(async (req, res, next) => {
  const { product_id, quantity } = req.body;
  const user = req.currentUser.id;

  const product = await Product.findById(product_id);

  let cart = await Cart.findOne({ user });

  if (cart) {
    const productIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === product_id
    );

    if (productIndex > -1) {
      // If it exists, increase the quantity
      cart.items[productIndex].quantity = quantity;
      cart.totalPrice = await calculateTotalPrice(cart, product);

      await cart.save();
    } else {
      const error = appError.create(
        message.productNotFound,
        404,
        httpStatusText.FAIL
      );
      return next(error);
    }
  }
  await createOrder(user, cart);

  return res.status(201).send({ status: httpStatusText.SUCCESS });
});

const deleteFromCart = asyncWrapper(async (req, res, next) => {
  const { product_id } = req.body;
  const user = req.currentUser.id;

  const product = await Product.findById(product_id);

  let cart = await Cart.findOne({ user });

  if (cart) {
    const productIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === product_id
    );

    if (productIndex > -1) {
      // If it exists, increase the quantity
      cart.items.splice(productIndex, 1);
      cart.totalPrice = await calculateTotalPrice(cart, product);
      await cart.save();
    }
  } else {
    const error = appError.create(
      message.productNotFound,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  await createOrder(user, cart);

  return res.status(201).send({ status: httpStatusText.SUCCESS, date: null });
});

const deleteCart = asyncWrapper(async (req, res, next) => {
  const user = req.currentUser.id;
  let cart = await Cart.findOne({ user });

  if (!cart) {
    const error = appError.create(
      message.noProductYet,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  await Cart.deleteOne({ user });
  await Order.deleteOne({ user, status: orderStatus.pending });

  return res.status(201).send({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
  createCart,
  viewCart,
  updateCart,
  deleteFromCart,
  deleteCart,
};
