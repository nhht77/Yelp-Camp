const express    = require("express"),
      app        = express(),
      bodyParser = require("body-parser"),
      mongoose   = require('mongoose'),
      PORT       = 3000,
      Campground = require("./models/campground"),
      Comment    = require("./models/comment"),
      seedDB     = require("./seeds");

// CONFIG
mongoose.connect('mongodb://localhost:27017/Yelpcamp', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
seedDB();
    
app.get("/", (req, res) => {
    res.render("landing");
});

// CAMPGROUNDS ROUTE //

//GET ALL : API/Index
app.get("/campgrounds", (req, res) => {
    Campground.find({}, (err, allCampground) => {
        if (err) {
            console.log(err);
        } else {
            res. render("campgrounds/index", {campgrounds : allCampground});
        }
    })
});

//POST : API/CAMPGROUNDS
app.post("/campgrounds", (req, res) => {
    // get data from form and add to campgrounds db
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name: name, image: image, description: description};

    Campground.create( newCampground, err => {
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    })
    
});

//GET : API/NEW
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new"); 
 });

 //SHOW : API/CAMPGROUNDS/:ID
app.get("/campgrounds/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec( (err, foundCampground) => {
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
})

// COMMENT ROUTE //

app.get("/campgrounds/:id/comments/new", function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

app.post("/campgrounds/:id/comments", (req, res) => {
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

app.listen(PORT, () => {
   console.log("The YelpCamp Server Has Started On Port 3000!");
});