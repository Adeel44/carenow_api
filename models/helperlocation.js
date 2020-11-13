var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var HelperLocationSchema = new mongoose.Schema({  
     helper_id: { type: Schema.Types.ObjectId, required: true, ref: "Helper" },
    //request_id: { type: String, required: true },
   // location: [lat,lng],    
     latitude: { type: Number, required: true },
     longitude: { type: Number, required: true },
   // booking_id: { type: Schema.Types.ObjectId, required: true, ref: "Booking"},    
}, {
        timestamps: true
    });

module.exports = mongoose.model("HelperLocation", HelperLocationSchema);