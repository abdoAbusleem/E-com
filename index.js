const express = require("express");
const Mongoose = require("./DBconfing/DBconnection");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const httpStatusText = require("./Enums/httpStatusText");
const categoriesRouter = require("./routes/categories");
const productsRouter = require("./routes/products");
const usersRouter = require("./routes/users");
const ratingRouter = require("./routes/rating");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const brandRouter = require("./routes/brands");
const verfiyToken = require("./middleware/verfiyToken");

const app = express();

require("dotenv").config();

app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser());

app.use(cors());
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);
//routes
app.use("/api/category", verfiyToken, categoriesRouter);
app.use("/api/product", verfiyToken, productsRouter);
app.use("/api/user", usersRouter);
app.use("/api/rating", verfiyToken, ratingRouter);
app.use("/api/Cart", verfiyToken, cartRouter);
app.use("/api/order", verfiyToken, orderRouter);
app.use("/api/brand", verfiyToken, brandRouter);

// //Dbconnect
Mongoose.then(() => {
  console.log("connected to mongoDB server");
}).catch((e) => {
  console.log("failed", e.message);
});

// global routes handlers is not found
app.all("*", (req, res, next) => {
  return res.send({
    status: httpStatusText.ERROR,
    message: "this resource is not available",
  });
});

// global error handler
app.use((error, req, res, next) => {
  return res.status(error.statusCode || 500).send({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

require("./Confing/passportConfig")(app);

const Port = process.env.Port || 5000;
app.listen(Port, () => console.log(`server is running on port ${Port}`));
