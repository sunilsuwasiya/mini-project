const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const bodyparser = require("body-parser");
const nodemailer = require("nodemailer");
const http = require("http");

dotenv.config({ path: "./.env" });

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Route definitions
app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

// Public folder definition
app.set("view engine", "ejs");
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));
// Database connection
const con = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
  port: process.env.port_no,
});

con.connect((err) => {
  if (err) {
    console.log("ERROR: " + err);
  } else {
    console.log("MySQL Database connected!");
  }
});

// Body parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Static folder
app.use("/public", express.static(path.join(__dirname, "public")));

let email;
let otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "sunilsuwasiya2000@gmail.com",
    pass: "azugmrpgehjbkdoh",
  },
});

app.post("/otp", (req, res) => {
  email = req.body.email;
  const firstname = req.body.vorname;

  const mailOptions = {
    to: req.body.email,
    subject: `OTP for registration is: ${otp}`,
    html: `<div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
       <h1 style="color: #00466a; text-align: center;">Your Brand</h1>
       <p style="font-size: 16px;">Hi ${firstname},</p>
       <p style="font-size: 16px;">Thank you for choosing Your Brand. Please use the following OTP to complete your sign-up procedure. The OTP is valid for 5 minutes:</p>
       <h2 style="background: #00466a; color: #fff; text-align: center; padding: 10px; border-radius: 4px; font-size: 24px;">${otp}</h2>
       <p style="font-size: 16px;">Regards,<br />Your Brand Team</p>
       <hr style="border:none;border-top:1px solid #eee" />
       <p style="font-size: 14px; color: #aaa; text-align: right;">Your Brand Inc<br />1600 Amphitheatre Parkway<br />California</p>
     </div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.render('otp');
  });
});

app.post("/verify", (req, res) => {
  if (req.body.otp == otp) {
    res.render('login');
   
  } else {
    res.send('<h1>Incorrect OTP</h1>');
  }
});


app.post("/resend", (req, res) => {
  const mailOptions = {
    to: email,
    subject: `OTP for registration is: ${otp}`,
    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
       <div style="margin:50px auto;width:70%;padding:20px 0">
         <div style="border-bottom:1px solid #eee">
           <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Brand</a>
         </div>
         <p style="font-size:1.1em">Hi ${firstname},</p>
         <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
         <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
         <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
         <hr style="border:none;border-top:1px solid #eee" />
         <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
           <p>Your Brand Inc</p>
           <p>1600 Amphitheatre Parkway</p>
           <p>California</p>
         </div>
       </div>
     </div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    res.send('<h1>OTP has been resent</h1>');
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`App is live at ${port}`);
});
