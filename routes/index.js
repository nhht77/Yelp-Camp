const router      = require('express').Router(),
      passport = require('passport'),
      User     = require('../models/user');

router.get("/", (req, res) => {
    res.render("landing");
});

////////////////
// AUTH ROUTE // 
////////////////

// GET API/register
router.get('/register', (req, res) => {
    res.render('register');
})

// POST API/register --- HANDLING LOGIC
router.post("/register", function(req, res){
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
router.get("/login", (req, res) => {
    res.render('login');
})

// POST API/login
router.post("/login", passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/campgrounds' }) ,(req, res) =>{
});

// Logout Logic
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;