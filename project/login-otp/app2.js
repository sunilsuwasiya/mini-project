const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require("path");
const bodyparser = require("body-parser");
const nodemailer = require("nodemailer");
// const exphbs = require('exphb')

dotenv.config({ path: "./.env" });

const app = express();

app.use(express.urlencoded());
app.use(express.json());

//Route definieren
app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));
// app.use("/auth", require("./routes/pages"));

// app.use('/', require('./routes/auth'));

//public folder definieren
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));

app.set("view engine", "hbs");

const con = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
});

con.connect((err) => {
  if (err) {
    console.log("ERRORRRRRRR : " + err);
  } else {
    console.log("Mysql Database connected!!!!");
  }
});
// app.engine('handlebars',exphbs({ extname: "hbs", defaultLayout: false, layoutsDir: "views/ "}));
// app.set('view engine','hbs');

// body parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//static folder
app.use("/public", express.static(path.join(__dirname, "public")));

var email;
var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "sunilsuwasiya2000@gmail.com",
    pass: "azugmrpgehjbkdoh",
  },
});

app.post("/otp", function (req, res) {
  email = req.body.email;
  firstname = req.body.vorname;

  var mailOptions = {
    to: req.body.email,
    subject: `Otp for registration is: ${otp}`,
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

    res.render("otp", { msg: "otp has been sent" });
  });
});

app.post("/verify", function (req, res) {
  if (req.body.otp == otp) {
    res.render("login");
  } else {
    res.render("otp", { msg: "otp is incorrect" });
  }
});

app.post("/resend", function (req, res) {
 
  

  var mailOptions = {
    to:email,
    subject: `Otp for registration is: ${otp}`,
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
    res.render("otp", { msg: "otp has been sent" });
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`app is live at ${port}`);
});
