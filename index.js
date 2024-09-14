const express = require('express');
const Mongoose = require("./DBconfing/DBconnection");
const morgan = require('morgan');
const cors = require('cors');
const httpStatusText = require('./Enums/httpStatusText');
const categoriesRouter = require('./routes/categories');
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');









const app = express();


app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());


//routes
app.use("/api/category", categoriesRouter);
app.use("/api/product", productsRouter);
app.use("/api/user", usersRouter);






// //Dbconnect
Mongoose.then(() => {
    console.log("connected to mongoDB server");
}).catch((e) => {
    console.log("failed", e.message)
});




// global routes handlers is not found
app.all('*' , (req, res , next) => {
    return res.send({status : httpStatusText.ERROR ,message : 'this resource is not available'});
 });
 

// global error handler 
app.use((error , req , res , next )=> {
 return res.status(error.statusCode || 500).send({status : error.statusText || httpStatusText.ERROR , message : error.message , code : error.statusCode || 500 ,data : null });
});








require('dotenv').config();
const Port = process.env.Port || 5000;
app.listen(Port,()=>console.log(`server is running on port ${Port}`));