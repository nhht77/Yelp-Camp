const router        = require('express').Router(),
      Comment    = require('../models/comment'),
      Campground = require('../models/campground');

router.get("/campgrounds/:id/comments/new", (req, res) => {
    // find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

router.post("/campgrounds/:id/comments", isLoggedIn ,(req, res) => {
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

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;