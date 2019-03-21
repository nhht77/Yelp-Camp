const router        = require('express').Router(),
      Campground = require('../models/campground'),
      middleware    = require('../middleware/index');

// CAMPGROUNDS ROUTE //

//GET ALL : API/Index
router.get("/", (req, res) => {

    let isMatch = null;

    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}, (err, campgrounds) => {
            if (err) throw err;
            if(campgrounds.length < 1){
                isMatch = "There is no matching campground, please try again!"
            }
            res.render("campgrounds/index", {campgrounds, isMatch});
        })
    }
    else {
        Campground.find({}, (err, campgrounds) => {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", {campgrounds, isMatch});
            }
        })
    }
});

//POST : API/CAMPGROUNDS
router.post("/", middleware.isLoggedIn, (req, res) => {
    // get data from form and add to campgrounds db
    let {name, image, description, cost} = req.body,
        author = {
            id: req.user._id,
            username: req.user.username
        },
        newCampground = {name , image, description, cost, author};

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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;