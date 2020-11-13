var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NotificationSchema = new mongoose.Schema({
    // coupon_id: { type: Schema.Types.ObjectId, required: true, ref: "Coupon" },
    // user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    request_id: { type: String, required: true },
    sender_id: { type: String, required: true },
    receiver_id: { type: String, required: true },
    booking_id: { type: String },
    sender_type: { type: String, enum: ['customer', 'helper', 'admin'], default: '' },
    receiver_type: { type: String, enum: ['customer', 'helper', 'admin'], default: '' }, 
    action: { type: String, default: ''}, 
    title: { type: String, required: true },
    message: { type: String, required: true },
    read_by_receiver: { type: Number, default: 0 },    
}, {
        timestamps: true
    });

module.exports = mongoose.model("Notification", NotificationSchema);