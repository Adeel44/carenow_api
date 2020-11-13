var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ChatSchema = new mongoose.Schema({  
    // user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    //request_id: { type: String, required: true },
    sender_id: { type: String, required: true },
    receiver_id: { type: String, required: true },    
    type: {type:String, required:true},
    // sender_type: { type: String, enum: ['customer', 'helper'], default: '' },
    // receiver_type: { type: String, enum: ['customer', 'helper'], default: '' }, 
    booking_id: { type: Schema.Types.ObjectId, required: true, ref: "Booking"},   
    message: { type: String, required: true },
    read_by_receiver: { type: Number, default: 0 },    
}, {
        timestamps: true
    });

module.exports = mongoose.model("Chat", ChatSchema);