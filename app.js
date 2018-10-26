const express       = require("express"),
      app           = express(),
      bodyParser    = require("body-parser"),
      mongoose      = require('mongoose'),
      PORT          = 3000,
      passport      = require("passport"),
      localStrategy = require("passport-local"),
      User          = require("./models/user"),
      Campground    = require("./models/campground"),
      Comment       = require("./models/comment"),
      seedDB        = require("./seeds");

// REQUIRE ROUTES
const campgroundRoute = require("./routes/campgrounds"),
      commentRoute    = require("./routes/comments"),
      indexRoute      = require("./routes/index");

// CONFIG
mongoose.connect('mongodb://localhost:27017/Yelpcamp', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();
    
// PASSPORT CONFIG
app.use(require('express-session')({
    secret: 'Secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

app.use(indexRoute);
app.use(campgroundRoute);
app.use(commentRoute);

app.listen(PORT, () => {
   console.log("The YelpCamp Server Has Started On Port 3000!");
});