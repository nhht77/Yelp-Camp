require("dotenv").config();

const express    = require("express"),
  app            = express(),
  bodyParser     = require("body-parser"),
  mongoose       = require("mongoose"),
  PORT           = 3000,
  passport       = require("passport"),
  methodOverride = require("method-override"),
  localStrategy  = require("passport-local"),
  User           = require("./models/user"),
  flash          = require("connect-flash");
  // Campground     = require("./models/campground"),
  // Comment = require("./models/comment"),
  // seedDB = require("./seeds");

// REQUIRE ROUTES
const campgroundRoute = require("./routes/campgrounds"),
  commentRoute = require("./routes/comments"),
  indexRoute = require("./routes/index");

// CONFIG
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
// seedDB(); // Seed Database //

// PASSPORT CONFIG
app.use(
  require("express-session")({
    secret: "Secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use("/", indexRoute);
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/comments", commentRoute);

app.listen(PORT, () => {
  console.log("The YelpCamp Server Has Started On Port 3000!");
});
