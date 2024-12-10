const nodemailer = require("nodemailer");
require("dotenv").config();
const ejs = require("ejs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  address: "smtp.gmail.com",
  domain: "gmail.com",
  authentication: "plain",
  auth: {
    user: process.env.email,
    pass: process.env.password,
  },
});

const sendNotification = async (to, product, name) => {
  ejs.renderFile(
    path.join(__dirname, "../") + "Emails/addProductsToCart.ejs",
    {
      product,
      name,
    },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        var mainOptions = {
          from: '"E-com" testmail@zoho.com',
          to,
          name,
          html: data,
        };
        transporter.sendMail(mainOptions, function (err, info) {
          if (err) {
            console.log(err);
          } else {
            console.log("Message sent: " + info.response);
          }
        });
      }
    }
  );
};

const sendResetcodeToMail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"Your App Name" <${process.env.email}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

module.exports = {
  sendResetcodeToMail,
  sendNotification,
};
