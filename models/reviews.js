var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ReviewSchema = new mongoose.Schema({
    rating_to: { type: Schema.Types.ObjectId, required: true, ref: "Helper" },
    rating_from: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    booking_id: { type: Schema.Types.ObjectId, required: true, ref: "Booking" },
    // review_title: { type: String, required: true },
    // review_description: { type: String, required: true },
    // rating: { type: Number, default: 0 },
    rate_points: { type: Number, default: 0 },
    rate_note: { type: String,required: true },
}, {
        timestamps: true
    });

module.exports = mongoose.model("Review", ReviewSchema);