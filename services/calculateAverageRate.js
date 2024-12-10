module.exports.calculateAndUpdateAverageRating = async (product) => {
  if (!product.ratings || product.ratings.length === 0) {
    product.averageRating = 0;
  } else {
    const sum = product.ratings.reduce(
      (total, rating) => total + rating.rating,
      0
    );
    const averageRating = sum / product.ratings.length;
    product.averageRating = Math.round(averageRating * 2) / 2; // Round to the nearest 0.5
  }
  await product.save();
};
