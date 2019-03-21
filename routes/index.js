const router      = require('express').Router(),
      passport    = require('passport'),
      User        = require('../models/user'),
      nodemailer  = require("nodemailer"),
      crypto      = require("crypto");


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
router.post("/register", (req, res) => { 
    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === "potato123"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => { 
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
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

// Forgot password
router.get('/forgot', (req, res) => {
    res.render('forgot');
});

router.post("/forgot", async (req, res, next) => {
    try
    {
        let token = await crypto.randomBytes(20, buff => JSON.stringify(buff));
        let user  = await User.findOne({email: req.body.email}, user => {
            if(!user) {
                req.flash("error", "No account with that email exits.");
                return res.redirect("/forgot");
            }
            user.resetPasswordToken   = token;
            user.resetPasswordExpired = Date.now() + 3600000; //1 hour
            
            return user;
        })

        let smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user:"nhht77@gmail.com",
                pass:process.env.GMAIL_PW
            }
        })

        let mailOptions = {
            to: user.email,
            from: 'nhht77@gmail.com',
            subject: 'Node.js Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        }

        smtpTransport.sendMail(mailOptions, () => {
            console.log("Email is sent.");
            req.flash("success", 'An e-mail has been sent to ' + user.email + ' with further instructions.')
        })
    } 
    
    catch(err)
    {
        throw err
    }
    
})


function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;