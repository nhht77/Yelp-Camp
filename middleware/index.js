var Campground = require("../models/campground");
var Comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next)=> {
 if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundCampground) => {
           if(err){
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) =>  {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment) => {
           if(err){
               res.redirect("back");
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

middlewareObj.checkReviewExistence = async (req, res, next) => {
    try {
        if(req.isAuthenticated){
            const campground = await Campground.findById(req.params.id).populate("reviews")
            if (!campground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            }
            else {
                let reviewUser = await campground.reviews.some( r => r.author.id.equals(req.user._id));
                if(reviewUser){
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + campground._id);
                }
                next();
            }
        }
        else {
            req.flash("error", "You need to login first.");
            res.redirect("back");
        }
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("back");
    }
}

module.exports = middlewareObj;