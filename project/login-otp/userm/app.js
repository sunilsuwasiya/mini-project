const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser'); 
const mysql = require('mysql'); 

require('dotenv').config();

const app = express();




app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended: true})); 


app.use(express.json()); 

app.use(express.static('public'));

const handlebars = exphbs.create({ extname: '.hbs',});
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');
app.post("/logout", (req, res) => {
      
        const newLocation = 'http://localhost:5000';

        res.redirect(302, newLocation);
  });


 
const routes = require('./server/routes/user');
app.use('/', routes);

const port = process.env.PORT || 5100;
app.listen(port, () => console.log(`Listening on port ${port}`));