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

app.get("/", (req, res) => {
    res.render("landing");
});

// CAMPGROUNDS ROUTE //

//GET ALL : API/Index
app.get("/campgrounds", (req, res) => {
    Campground.find({}, (err, allCampground) => {
        if (err) {
            console.log(err);
        } else {
            res. render("campgrounds/index", {campgrounds : allCampground});
        }
    })
});

//POST : API/CAMPGROUNDS
app.post("/campgrounds", (req, res) => {
    // get data from form and add to campgrounds db
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name: name, image: image, description: description};

    Campground.create( newCampground, err => {
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    })
    
});

//GET : API/NEW
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new"); 
 });

 //SHOW : API/CAMPGROUNDS/:ID
app.get("/campgrounds/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec( (err, foundCampground) => {
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
})

// COMMENT ROUTE //

app.get("/campgrounds/:id/comments/new", (req, res) => {
    // find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

app.post("/campgrounds/:id/comments", isLoggedIn ,(req, res) => {
    //LOOK UP CAMPGROUNDS BY ID
    Campground.findById(req.params.id, (err, campground) => {
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            //CREATE NEW COMMENTS
           Comment.create(req.body.comment, (err, comment) => {
               if(err){
                   console.log(err);
               }else {
                //CONNECT NEW COMMENT TO CAMPGROUNDS
                campground.comments.push(comment);
                campground.save();
                //REDIRECT CAMPGROUND TO SHOW PAGE
                res.redirect('/campgrounds/' + campground._id);
               }
           })
        }
        });
    });

// AUTH ROUTE // 

// GET API/register
app.get('/register', (req, res) => {
    res.render('register');
})

// POST API/register --- HANDLING LOGIC
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            console.log(user);
           res.redirect("/campgrounds"); 
        });
    });
});

//GET API/login
app.get("/login", (req, res) => {
    res.render('login');
})

// POST API/login
app.post("/login", passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/campgrounds' }) ,(req, res) =>{
});

// Logout Logic
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(PORT, () => {
   console.log("The YelpCamp Server Has Started On Port 3000!");
});