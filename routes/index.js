const router      = require('express').Router(),
      passport    = require('passport'),
      User        = require('../models/user'),
      nodemailer  = require("nodemailer"),
      Campground = require('../models/campground'),
      crypto      = require("crypto");


router.get("/", (req, res) => {
    res.render("landing");
});

////////////////
// AUTH ROUTE // 
////////////////

// GET API/register
router.get('/register', (req, res) => {
    res.render('auth/register');
})

// POST API/register --- HANDLING LOGIC
router.post("/register", (req, res) => { 
    let {username, password, email, firstName, lastName, avatar} = req.body;
    let newUser = new User({username, password, email, firstName, lastName, avatar});
    if(req.body.adminCode === "potato123"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => { 
        if(err){
            console.log(err);
            return res.render("auth/register", {error: err.message});
        }
        passport.authenticate("local")(req, res, () => {
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/campgrounds"); 
        });
    });
});

//GET API/login
router.get("/login", (req, res) => {
    res.render('auth/login');
})

// POST API/login
router.post("/login", passport.authenticate('local', 
    { 
        failureRedirect: '/login', 
        successRedirect: '/campgrounds',
        failureFlash: true,
        successFlash: 'Welcome to YelpCamp!'
    }) ,(req, res) =>{
});

// Logout Logic
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "See you later!");
    res.redirect("/");
})

// USER PROFILE

router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err){
            req.flash("error", "Something went wrong!");
            return res.redirect("/");
        }
        Campground.find().where('author.id').equals(user._id).exec( (err, campgrounds) => {
            if(err){
                req.flash("error", "Something went wrong!");
                return res.redirect("/");
            }
            res.render("auth/show", {user, campgrounds})
        })

    })
})

// Forgot password
router.get('/forgot', (req, res) => {
    res.render('auth/forgot');
});

router.post("/forgot", async (req, res, next) => {
    try
    {
        let token = await crypto.randomBytes(20).toString('hex');
        let user  = await User.findOne({email: req.body.email})
            if(!user) {
                console.log(req.body.email)
                req.flash("error", "No account with that email exits.");
                return res.redirect("/forgot");
            }
        user.resetPasswordToken   = token;
        user.resetPasswordExpired = Date.now() + 3600000; //1 hour

        console.log(user.resetPasswordExpired);
        console.log(token);
        console.log(user);

        let smtpTransport = await nodemailer.createTransport({
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
            console.log('An e-mail has been sent to ' + user.email + ' with further instructions.');
            req.flash("success", 'An e-mail has been sent to ' + user.email + ' with further instructions.')
            return res.redirect('/campgrounds')
        })
    } 
    
    catch(err)
    {
        res.redirect("/forgot");
        throw err;
    }
    
})


// Reset Password 

router.get('/reset/:token', async (req, res) => {
    const user = await User.find({resetPasswordToken: req.params.token});
    if(!user) console.log("No User");
    if(!user) {
        req.flash('error', "Password reset token is invalid or has expired")
        return res.redirect("/forgot");
    }
    res.render('auth/reset', {token: req.params.token});
})

router.post('/reset/:token', async (req, res) => {
    try {
            const user = await User.find({resetPasswordToken: req.params.token});
    
        if(!user){
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
        }
    
        if(req.body.password === req.body.confirm){
            await user.setPassword(req.body.password);
            user.resetPasswordToken   = undefined;
            user.resetPasswordExpired = undefined;
    
            const newUser = await user.save();
            req.logIn(newUser);
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
    
        let smtpTransport = await nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user:"nhht77@gmail.com",
                pass:process.env.GMAIL_PW
            }
        })
    
        console.log(user.email);
    
        let mailOptions = {
            to: user.email,
            from: 'nhht77@gmail.com',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        }
    
        smtpTransport.sendMail(mailOptions, () => {
            console.log('An e-mail has been sent to ' + user.email + ' with further instructions.');
            req.flash("success", 'An e-mail has been sent to ' + user.email + ' with further instructions.')
            return res.redirect('/campgrounds')
        })
    } catch (error) {
        console.log(error);
        res.redirect('/campgrounds');
    }
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;