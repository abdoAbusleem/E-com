const Product = require("../models/product");
const Category = require("../models/category");
const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../Enums/httpStatusText");
const appError = require("../utils/appError");
const filterObject = require("../utils/filterObject");
const message = require("../Enums/errorMessage");
const rating = require("../models/rating");
const { allow } = require("joi");

const productList = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const limit = query.limit;
  const page = query.page;
  const skip = (page - 1) * limit;

  const productList = await Product.find()
    .select(" _id productName thumbnail price ")
    .limit(limit)
    .skip(skip);

  if (productList.length == 0) {
    const error = appError.create(
      message.noProductYet,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, productList });
});

const getSingleProduct = asyncWrapper(async (req, res, next) => {
  let product = await Product.findById(req.params.id).populate([
    { path: "category" },
    {
      path: "ratings",
      select: "-product",
      populate: {
        path: "user",
        select: ["firstName", "lastName"], // Only include the 'name' field of the user
      },
    },
    { path: "brand" },
  ]);

  if (!product) {
    const error = appError.create(
      message.productNotFound,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res.status(200).send({ status: httpStatusText.SUCCESS, product });
});

const productCount = asyncWrapper(async (req, res, next) => {
  const productCount = await Product.estimatedDocumentCount();

  if (productList.length == 0) {
    const error = appError.create(
      message.productNotFound,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, productCount });
});

const filterByCategory = asyncWrapper(async (req, res, next) => {
  let filter = {};
  if (req.body.categories) {
    filter = { category: { $in: req.body.categories } };
  }
  const productList = await Product.find(filter).populate("category");

  if (productList.length == 0) {
    const error = appError.create(message.productNot, 404, httpStatusText.FAIL);
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, productList });
});

const filterProducts = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const { minPrice, maxPrice } = query;

  query.productName = { $regex: ".*" + query.productName + ".*" };

  const ignores = ["minPrice", "maxPrice", "name"];

  filterObject(query, ignores);

  if (!maxPrice) {
    query.price = { $gte: minPrice ?? 0 };
  } else {
    query.price = { $gte: minPrice ?? 0, $lte: maxPrice };
  }

  const productList = await Product.find({ query }).select(
    " _id productName thumbnail price"
  );

  if (productList.length == 0) {
    const error = appError.create(
      message.productNotFound,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, productList });
});

module.exports = {
  productList,
  getSingleProduct,
  productCount,
  filterByCategory,
  filterProducts,
};
