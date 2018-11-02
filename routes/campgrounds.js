const router        = require('express').Router(),
      Campground = require('../models/campground'),
      middleware    = require('../middleware/index');

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
router.post("/", middleware.isLoggedIn, (req, res) => {
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
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
        Campground.findByIdAndUpdate(req.params.id, req.body.campground , (err, updatedCampground) => {
            if(err){
                res.redirect("/campgrounds");
            } else {
                res.redirect("/campgrounds/" + req.params.id);
            }
        });
});

router.delete("/:id", middleware.checkCampgroundOwnership , (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("/");
        }else{
            res.redirect("/campgrounds");
        }
    })
})

module.exports = router;