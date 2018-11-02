const router        = require('express').Router({mergeParams: true}),
      Comment       = require('../models/comment'),
      Campground    = require('../models/campground');

router.post("/", isLoggedIn ,(req, res) => {
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
                //add username and id to comment
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                //save comment
                comment.save();
                campground.comments.push(comment);
                campground.save();
                res.redirect('/campgrounds/' + campground._id);
               }
           })
        }
        });
    });

// COMMENT UPDATE
router.put("/:comment_id", checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
       if(err){
           res.redirect("back");
       } else {
           res.redirect("/campgrounds/" + req.params.id );
       }
    });
 });
 
 // COMMENT DESTROY ROUTE
 router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, err => {
       if(err){
           res.redirect("back");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

function checkCommentOwnership(req, res, next) {
    if(req.isAuthenticated()){
           Comment.findById(req.params.comment_id, (err, foundComment) => {
              if(err){
                  res.redirect("back");
              }  else {
                  // does user own the comment?
               if(foundComment.author.id.equals(req.user._id)) {
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

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;