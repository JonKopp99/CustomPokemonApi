require('dotenv').config();
var exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const express = require('express')
const expressValidator = require('express-validator');
const app = express()
const pokemons = require('./controllers/pokemons');
const comments = require('./controllers/comments.js')(app);
const theauth = require('./controllers/auth');
var cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

// Set db
require('./data/pokemon-db');
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use(cookieParser());

var checkAuth = (req, res, next) => {
  console.log("Checking authentication");
  if (typeof req.cookies.nToken === "undefined" || req.cookies.nToken === null) {
    req.user = null;
    console.log("Bad Auth")
  } else {
    var token = req.cookies.nToken;
    var decodedToken = jwt.decode(token, { complete: true }) || {};
    console.log("Good Auth")
    console.log(decodedToken.payload)
    req.user = decodedToken.payload;
    currentUser = req.user
  }

  next();
};
app.use(checkAuth);
const Pokemon = require('./models/pokemon');


app.get("/n/:level", function (req, res) {
    var currentUser = req.user;
    Pokemon.find({ level: req.params.level }).lean()
        .then(pokemons => {
            res.render("pokemons-index", { pokemons, currentUser });
        })
        .catch(err => {
            console.log(err);
        });
});
app.get('/', (req, res) => {
        var currentUser = req.user;
        // res.render('home', {});
        console.log(req.cookies);
        Pokemon.find().populate('author')
        .then(pokemons => {
            res.render('pokemons-index', { pokemons, currentUser });
            // res.render('home', {});
        }).catch(err => {
            console.log(err.message);
        })
    })


app.use('/a', theauth)

app.use('/pokemons', pokemons)

app.listen(3000, () => {
    console.log('App listening on port 3000!')
})
module.exports = app;
