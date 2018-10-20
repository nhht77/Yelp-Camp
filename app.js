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
// seedDB();
    
app.get("/", (req, res) => {
    res.render("landing");
});

//GET ALL : API/Index
app.get("/campgrounds", (req, res) => {
    Campground.find({}, (err, allCampground) => {
        if (err) {
            console.log(err);
        } else {
            res. render("index", {campgrounds : allCampground});
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
    res.render("new"); 
 });

 //SHOW : API/CAMPGROUNDS/:ID
app.get("/campgrounds/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec( (err, foundCampground) => {
        if(err){
            console.log(err);
        }else{
            console.log(foundCampground);
            res.render("show", {campground: foundCampground});
        }
    });
})

app.listen(PORT, () => {
   console.log("The YelpCamp Server Has Started On Port 3000!");
});