module.exports.calculateTotalPrice = async (cart, product) => {
  return cart.items.reduce(
    (total, item) => total + item.quantity * product.price,
    0
  );
};
