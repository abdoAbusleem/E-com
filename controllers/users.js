const User = require('../models/user');
const asyncWrapper = require('../middleware/asyncWrapper');
const httpStatusText = require('../Enums/httpStatusText');
const appError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/generateJWT');








const getAllUsers = asyncWrapper(async (req, res) => {


    const query = req.query;
    const limit = query.limit
    const page = query.page
    const skip = (page -1) * limit

    const userList = await User.find().select('-password').limit(limit).skip(skip);
    
    if(userList.length  == 0){
        const error = appError.create('products is not find' , 404 , httpStatusText.FAIL);
        return next(error);
    };


    return res.status(200).json({status : httpStatusText.SUCCESS , data : {userList} });

   
});




const getSingleUser = asyncWrapper (async (req, res , next) => {
    
    let user =await User.findById(req.params.id).select('-password')

    if(!user){
        const error = appError.create('user is not found' , 404 , httpStatusText.FAIL)
        return next(error);
    };

    return res.status(200).send({status : httpStatusText.SUCCESS , data : {user} });

})






const register = asyncWrapper(async (req, res ,next) => {

    const {firstName, lastName, email, password, role, zip, country, phone, type, street, city, appartment} = req.body;

    const oldUser = await User.findOne({email: email});

    if(oldUser){
        const error = appError.create('user already exist' , 400 , httpStatusText.FAIL);
        return next(error);
    };

    const hashedPassword =await bcrypt.hash(password ,10)

    const newUser = new User({
        firstName, 
        lastName, 
        email, 
        password : hashedPassword,
        role, 
        zip, 
        country, 
        phone, 
        type, 
        street, 
        city, 
        appartment
    });

    await newUser.save();

    const token = await generateJWT({id :newUser._id , role: newUser.role , type : newUser.type});


    return res.status(201).send({status : httpStatusText.SUCCESS , data : {user : newUser , token } });
   
})








const login = asyncWrapper(async(req , res , next)=>{

    const {email , password} = req.body;

    if(!email && !password){
        const error = appError.create('email and password is required' , 400 , httpStatusText.FAIL);
        return next(error);
    }

    const user = await User.findOne({email : email});

    if(!user){
        const error = appError.create('user is not found' , 400 , httpStatusText.FAIL);
        return next(error);
    }

    const matchedPassword = await bcrypt.compare(password, user.password)


    if(matchedPassword){
        const token = await generateJWT({id :user._id , role: user.role , type : user.type});

        return res.status(201).send({status : httpStatusText.SUCCESS , data : {token} });
    }else{
        const error = appError.create('something wrong' , 500 , httpStatusText.ERROR);
        return next(error);
    }

});






















module.exports = {
    getAllUsers,
    getSingleUser,
    register,
    login
};