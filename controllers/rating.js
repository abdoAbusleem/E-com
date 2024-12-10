const Rating = require("../models/rating");
const Product = require("../models/product");
const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../Enums/httpStatusText");
const appError = require("../utils/appError");
const message = require("../Enums/errorMessage");
const {
  calculateAndUpdateAverageRating,
} = require("../services/calculateAverageRate");

const addRating = asyncWrapper(async (req, res, next) => {
  const { product, rating, review } = req.body;
  const user = req.currentUser.id;

  const findProduct = await Product.findById({ _id: product }).populate(
    "ratings"
  );
  if (!findProduct) {
    const error = appError.create(
      message.productNotFound,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const newRating = new Rating({
    user,
    product,
    rating,
    review,
  });

  await newRating.save();

  findProduct.ratings.push(newRating);
  await findProduct.save();
  calculateAndUpdateAverageRating(findProduct);
  return res.status(201).send({ status: httpStatusText.SUCCESS });
});

const updateRate = asyncWrapper(async (req, res, next) => {
  const { ratingId, rating, review } = req.body;
  const user = req.currentUser.id;

  // Find the rating by ID
  const existingRating = await Rating.findOne({ _id: ratingId, user });

  if (!existingRating) {
    const error = appError.create("Rating not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  existingRating.rating = rating;
  existingRating.review = review;

  await existingRating.save();

  const product = await Product.findById(existingRating.product);
  if (product) {
    const ratingIndex = product.ratings.findIndex(
      (r) => r.toString() === ratingId
    );
    if (ratingIndex !== -1) {
      product.ratings[ratingIndex] = existingRating._id;
      await product.save();
    }
  }
  return res.status(200).send({ status: httpStatusText.SUCCESS });
});

module.exports = {
  addRating,
  updateRate,
};
