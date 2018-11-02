const router        = require('express').Router(),
      Campground = require('../models/campground');

// CAMPGROUNDS ROUTE //

//GET ALL : API/Index
router.get("/", (req, res) => {
    Campground.find({}, (err, allCampground) => {
        if (err) {
            console.log(err);
        } else {
            res. render("campgrounds/index", {campgrounds : allCampground});
        }
    })
});

//POST : API/CAMPGROUNDS
router.post("/", isLoggedIn, (req, res) => {
    // get data from form and add to campgrounds db
    var name = req.body.name;
        image = req.body.image,
        description = req.body.description,
        author = {
            id: req.user._id,
            username: req.user.username
        },
        newCampground = {name: name, image: image, description: description, author: author};

    Campground.create( newCampground, err => {
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    })
    
});

 //SHOW : API/CAMPGROUNDS/:ID
router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec( (err, foundCampground) => {
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// PUT : API/CAMPGROUNDS/:ID
router.put("/:id", (req, res) => {
    // Is This User Logged In?
    if(req.isAuthenticated()){
        Campground.findByIdAndUpdate(req.params.id, req.body.campground , (err, updatedCampground) => {
            if(err){
                res.redirect("/campgrounds");
            } else {
                // Does this User Own This Campground?
                if(updatedCampground.author._id.equals(req.user._id)){
                    res.redirect("/campgrounds/" + req.params.id);
                } else {
                    res.send('YOU DO NOT HAVE PERMISSION TO DO THAT');
                }
               
            }
        });
    } else {
        res.send('You need to Log in to Post A Campsite')
    }
    
    // Otherwise/if not, redirect
    
})

router.delete("/:id", (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("/");
        }else{
            res.redirect("/campgrounds");
        }
    })
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next){
    if(req.isAuthenticated()){
        Campground.findByIdAndUpdate(req.params.id, req.body.campground , (err, updatedCampground) => {
            if(err){
                res.redirect("back");
            } else {
                // Does this User Own This Campground?
                if(updatedCampground.author._id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } 
}

module.exports = router;