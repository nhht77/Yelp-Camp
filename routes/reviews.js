let express = require("express");
let router = express.Router({mergeParams: true});
let Campground = require("../models/campground");
let Review = require("../models/review");
let middleware = require("../middleware");

router.get("/", async ( req, res ) => {
    try {
        const campground = await Campground.findById(req.params.id).populate({path:"review", options:{sort:{createdAt:-1}}});
        if(!campground){
            req.flash("error", "There is no rating for campgrounds yet.");
            return res.redirect("back");
        }
        res.render("reviews/index", {campground: campground});
    } 
    catch (error) {
        req.flash("error", error.message);
        return res.redirect("back");
    }
})

router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, async (req, res) => {
    try {
        const campground = await Campground.findById(req.params.id);
        res.render("reviews/new", {campground: campground});
    } 
    catch (error) {
        req.flash("error", error.message);
        return res.redirect("back");
    }
})

router.post('/', middleware.isLoggedIn, middleware.checkReviewExistence, async (req, res) => {
    try {
        const campground = await Campground.findById(req.params.id).populate({path:"review", options:{sort:{createdAt:-1}}});
        const review     = await Review.create(req.body.review);
        const {id, username} = req.user;
        const review = {id, username, campground};

        review.save();
        campground.reviews.push(review);
        campground.rating = calculateAverage(campground.reviews);
        campground.save();
        req.flash("success", "Your review has been successfully added.");
        res.redirect('/campgrounds/' + campground._id);
    } 
    catch (error) {
        req.flash("error", error.message);
        return res.redirect("back");
    }
})