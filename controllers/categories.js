const Category = require("../models/category");
const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../Enums/httpStatusText");
const appError = require("../utils/appError");
const message = require("../Enums/errorMessage");

const categoryList = asyncWrapper(async (req, res, next) => {
  const categoryList = await Category.find();

  if (categoryList.length == 0) {
    const error = appError.create(
      message.categoryNotFound,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res.status(200).json({ status: httpStatusText.SUCCESS, categoryList });
});

const getSingleCategory = asyncWrapper(async (req, res, next) => {
  let category = await Category.findById(req.params.id, {
    __v: false,
  });

  if (!category) {
    const error = appError.create(
      message.categoryNotFound,
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  return res.status(200).send({ status: httpStatusText.SUCCESS, category });
});

module.exports = {
  categoryList,
  getSingleCategory,
};
