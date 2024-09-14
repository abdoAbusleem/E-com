const router = require('express').Router();

const {
      createProduct , 
      productList , 
      getSingleProduct ,
      updateProduct , 
      deleteProduct , 
      productCount ,
      featuredProduct,
      filterByCategory, 
      filterProducts,
      updateProductCategory,
    } = require('../controllers/products');





router.post('/create', createProduct);

router.get('/products', productList);

router.get('/singleProduct/:id', getSingleProduct);

router.patch('/update/:id', updateProduct);

router.patch('/updatecategory/:id', updateProductCategory);

router.delete('/delete/:id', deleteProduct);

router.get('/counts', productCount);  

router.get('/featured', featuredProduct);

router.get('/ByCategory', filterByCategory);

router.get('/search', filterProducts);


























module.exports = router