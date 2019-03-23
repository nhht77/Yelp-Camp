const mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   info:[String],
   cost:Number,
   createdAt: { type: Date, default: Date.now},
   author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        username:String
    },
   comments: [
       {
          type: mongoose.Schema.Types.ObjectId,
          ref: "comment"
       }
    ],
   reviews: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review"
      }
   ],
   rating: {
         type: Number,
         default: 0
   }
 });

module.exports = mongoose.model("Campground", campgroundSchema);