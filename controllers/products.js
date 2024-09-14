const Product = require('../models/product');
const Category = require('../models/category')
const asyncWrapper = require('../middleware/asyncWrapper');
const httpStatusText = require('../Enums/httpStatusText');
const appError = require('../utils/appError');
const filterObject = require('../utils/filterObject');





const createProduct = asyncWrapper(async(req, res, next) => {
        const category = await Category.findById(req.body.category)
    
         if(!category){
        const error = appError.create('the category is not found' , 404 , httpStatusText.FAIL)
        return next(error);   
         } 

        const newProduct = new Product({...req.body});

        await newProduct.save()

        return res.status(201).send({status : httpStatusText.SUCCESS , data : {product : newProduct} });

     })



     
const productList = asyncWrapper(async (req , res , next)=>{

    
    const query = req.query;
    const limit = query.limit
    const page = query.page
    const skip = (page -1) * limit

    const productList = await Product.find().populate('category').limit(limit).skip(skip);

    if(productList.length  == 0){
        const error = appError.create('products is not find' , 404 , httpStatusText.FAIL)
        return next(error);
    }

    return res.status(200).json({status : httpStatusText.SUCCESS , data : {productList} });

})


const getSingleProduct = asyncWrapper (async (req, res , next) => {
    
    let product =await Product.findById(req.params.id).populate('category');

    if(!product){
        const error = appError.create('product is not found' , 404 , httpStatusText.FAIL)
        return next(error);
    };

    return res.status(200).send({status : httpStatusText.SUCCESS , data : {product} });

    
});



const updateProduct =asyncWrapper(async (req, res , next) =>{

    await Product.updateOne({_id: req.params.id}, {$set :{...req.body}});

    const product = await Product.findById(req.params.id).populate('category');

    if(!product){
        const error = appError.create('the product is not found' , 404 , httpStatusText.FAIL)
        return next(error);   
     }


    return res.status(200).send({status : httpStatusText.SUCCESS , data : {product} });

});


const updateProductCategory = asyncWrapper(async (req, res , next) =>{

    
    const category = await Category.findById(req.body.category);

    if(!category){
        const error = appError.create('the category is not found' , 400 , httpStatusText.FAIL)
        return next(error);   
     }

    await Product.updateOne({_id: req.params.id}, {$set :{category : req.body.category}})


    const product = await Product.findById(req.params.id).populate('category');;

    if(!product){
        const error = appError.create('the product is not found' , 404 , httpStatusText.FAIL)
        return next(error);   
     }


    return res.status(200).send({status : httpStatusText.SUCCESS , data : {product} });

});


const deleteProduct= asyncWrapper(async (req , res , next)=>{

    const product = await Product.findById(req.params.id);

    if(!product){
        const error = appError.create('the product is not found' , 404 , httpStatusText.FAIL)
        return next(error);   
     }


    await Product.deleteOne({_id: req.params.id});

    res.status(200).send({status : httpStatusText.SUCCESS , data : null});
   
});




const productCount = asyncWrapper(async (req , res , next)=>{

    const productCount = await Product.estimatedDocumentCount()

    if(productList.length  == 0){
        const error = appError.create('products is not find' , 404 , httpStatusText.FAIL)
        return next(error);
    }

    return res.status(200).json({status : httpStatusText.SUCCESS , data : {productCount} });

})



const featuredProduct = asyncWrapper(async (req , res , next)=>{

    const featuredProduct = await Product.find()

    if(productList.length  == 0){
        const error = appError.create('products is not find' , 404 , httpStatusText.FAIL)
        return next(error);
    }

    return res.status(200).json({status : httpStatusText.SUCCESS , data : {featuredProduct} });

})


const filterByCategory = asyncWrapper(async (req , res , next)=>{


    let filter = {};
    
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }


    const productList = await Product.find(filter).populate('category');

    if(productList.length  == 0){
        const error = appError.create('products is not find' , 404 , httpStatusText.FAIL)
        return next(error);
    }

    return res.status(200).json({status : httpStatusText.SUCCESS , data : {productList} });

})




const filterProducts = asyncWrapper(async (req , res , next)=>{
    const query = req.query
    const {minPrice, maxPrice} = query

    query.name= { $regex: '.*' + query.name + '.*' };

    const ignores = ['minPrice', 'maxPrice' , 'name']

    filterObject(query, ignores)

    
    if(!maxPrice){
       query.price =  {$gte: minPrice ?? 0 }
    }else{
        query.price = {$gte: minPrice ?? 0, $lte: maxPrice }
    }

    
    const productList = await Product.find(query).populate('category');

    if(productList.length  == 0){
        const error = appError.create('products is not find' , 404 , httpStatusText.FAIL)
        return next(error);
    }

    return res.status(200).json({status : httpStatusText.SUCCESS , data : {productList} });

})






     module.exports = {
        createProduct,
        productList,
        getSingleProduct,
        updateProduct,
        deleteProduct,
        productCount,
        featuredProduct,
        filterByCategory,
        filterProducts,
        updateProductCategory,
     }