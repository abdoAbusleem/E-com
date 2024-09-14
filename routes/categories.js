const router = require('express').Router();

const {categoryList , createCategory ,deleteCategory , getSingleCategory , updateCategory} = require('../controllers/categories')



router.get('/categories', categoryList)


router.get('/:id', getSingleCategory)


router.post('/create', createCategory)


router.patch('/update/:id', updateCategory)


router.delete('/delete/:id', deleteCategory)








module.exports = router