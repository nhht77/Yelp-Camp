let mongoose = require('mongoose');
let Schema   = new mongoose.Schema;

let reviewSchema = new Schema({
    rating:{
        type: Number,
        required: "Please provide a rating (1-5 stars).",
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value."
        }
    },
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground"
    },
    timestamps: true
})

module.exports = mongoose.model('review', reviewSchema);