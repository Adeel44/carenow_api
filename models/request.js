var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RequestSchema = new mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" }, 
    salutation: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: String, default: '' },
    height: { type: String, required: true },
    weight: { type: String, required: true},
    serviceforwhom: { type: String, required: true },
    requiredService: { type: String, required: true },
    requestDetails: { type: String, default: ''},
    // hearingProblem: { type: String, enum: ['yes', 'no'], default: 'no' },
    // sightProblem: { type: String, enum: ['yes', 'no'], default: 'no' },
    // verbalisationProblem: { type: String, enum: ['yes', 'no'], default: 'no' },
    // comprehension: { type: String, enum: ['yes', 'no'], default: 'no' },
    // orientation: { type: String, enum: ['yes', 'no'], default: 'no' }, 
    // memory:{ type: String, enum: ['yes', 'no'], default: 'no' },
    // mood:{ type: String, enum: ['yes', 'no'], default: 'no' },
    // anxiety:{ type: String, enum: ['yes', 'no'], default: 'no' },
    // restless:{ type: String, enum: ['yes', 'no'], default: 'no' },
    // noiseyBehaviour:{ type: String, enum: ['yes', 'no'], default: 'no' },
    // aggressive:{ type: String, enum: ['yes', 'no'], default: 'no' },
    // responseToCare:{ type: String, enum: ['yes', 'no'], default: 'no' },
    status: { type: Number, default: 0 },  //1 approve, 2 unapproved, 3 booking done
    booking_id: { type: Schema.Types.ObjectId, ref: "Booking" },
      // block: { type: Boolean, default: false }
  //  read_status:{ type: String, enum: ['yes', 'no'], default: '' },
}, {

        timestamps: true
    });

module.exports = mongoose.model("Request", RequestSchema);