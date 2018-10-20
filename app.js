const express    = require("express"),
      app        = express(),
      bodyParser = require("body-parser"),
      mongoose   = require('mongoose'),
      PORT       = 3000,
      Campground = require("./models/campground"),
      seedDB      = require("./seeds");

// CONFIG
mongoose.connect('mongodb://localhost:27017/Yelpcamp', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
seedDB()

// Campground.create({
//     name: "Yosemite Valley",
//     image: "https://images.unsplash.com/photo-1465695954255-a262b0f57b40?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=06d92f647a2937af54f658e199c3d990&auto=format&fit=crop&w=1050&q=80",
//     description: "Glacial valley in Yosemite National Park, no water and bathroom"
// }, function(error, campground) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log("NEWLY CREATED CAMPGROUND: ");
//         console.log(campground);
//     }
// });
    
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

 //GET : API/CAMPGROUNDS/:ID
app.get("/campgrounds/:id", (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err){
            console.log(err);
        }else{
            res.render("show", {campground: foundCampground});
        }
    });
})

app.listen(PORT, () => {
   console.log("The YelpCamp Server Has Started On Port 3000!");
});