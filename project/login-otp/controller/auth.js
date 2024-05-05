const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const app = require("express");

const con = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE
})


exports.login = async (req, res) => {

    try {
        
        const { email, password } = req.body;
        if ( !email || !password ) {
            return res.status(400).render('login', {
                message : 'Please provide an email and password'
            });
        }

        con.query('SELECT * FROM login WHERE email = ?', [email], async (err, result) => {

            
            if( err ) {
                return res.status(400).render('login', {
                    message: 'Email or password ist incorrect'
                })
            }

            
            if( result.length == 0 || !( await bcrypt.compare(password, result[0].password))) {
                return res.status(401).render('login', {
                    message : 'Email or Password ist incorrect!'
                });} 
                else{
                    const newLocation = 'http://localhost:5100';
                    res.redirect(302, newLocation);
                }
        });
    } catch (error) {
        return res.status(400).render('login', {
            message: 'Email or password ist incorrect'
        });
        
    }
}

exports.register = (req, res) => {
    
    const { vorname, nachname, email, password, passwordConfirm } = req.body;

    

    const query = 'SELECT * FROM login WHERE email = ?';
    con.query(query, [email], async (err, result) => {
        if(err) {
            throw err;
        }
        
        if( result.length > 0 ) {
            return res.render('register', {
                alert: 'That email is already in use!!!!'
            });
        } 
        else if ( password !== passwordConfirm ) {
            return res.render('register', {
                alert: 'Passwords don`t match'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        con.query('INSERT INTO login SET ?', {vorname:vorname, nachname:nachname, email:email, password:hashedPassword}, (err, result) => {

            if(err) {
                throw err;
            } else {
                return res.render('otp', {
                    message: 'User registered.'
                });
            } 
        });
    });   
}
