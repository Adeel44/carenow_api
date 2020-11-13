var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BookingSchema = new mongoose.Schema({ 
    //request_id: { type: String, required: true },
    request_id: {type: Schema.Types.ObjectId, ref: 'Request' ,required: true},
    //booking_by_user: { type: String, required: true },
    booking_by_user: {type: Schema.Types.ObjectId, ref: 'User' ,required: true},  
    helper_assign: {type: Schema.Types.ObjectId, ref: 'Helper' },
    requiredService: { type: String, required: true },
    serviceDate: { type: Date,  default: '' }, 
    serviceTime: { type: Date, default: ''},  //starttime
    seviceEndTime: { type: Date, default: ''},
    duration: { type: String, default: ''}, 
    comment: { type: String, default: ''}, 
    medicationPerDay: { type: String, default: '' },
   // medicationTime: { type: String, default: '' },
    medicationTime: [String],
    booking_status: {type: Number, default: 0},   //0=>booked(no helper assign), 1=> helper assigned ,2=>accepted by helper ,3=> rejected by helper,4=>job started, 5=>completed
    helper_visit_img: [String],  //array of string
    helper_summary: { type: String, default: ''},
    rate_by_customer: { type: Boolean, default: false},
    medication_status: {type: Number, default: 0},
    helper_startTime:  { type: Date, default: ''},
    helper_endTime:  { type: Date, default: ''},
    assign_by_admin:  {type: Schema.Types.ObjectId, ref: 'Admin' }, //new sub admin
    signature: {type: String, default: ''}
}, {
        timestamps: true
    });

module.exports = mongoose.model("Booking", BookingSchema);