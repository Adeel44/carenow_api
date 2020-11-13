var mongoose = require("mongoose");

var AdvertisementSchema = new mongoose.Schema({
    ad_image: { type: String, required: true },
    //category_icon: { type: String, required: true },
    
}, {
        timestamps: true
    });

module.exports = mongoose.model("Advertisement", AdvertisementSchema);