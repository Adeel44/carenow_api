var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
    // _id: { type: String, required: true },
   // user_type: {type:String,enum: ['customer', 'helper'], default: '' }
    firstname: { type: String, required: true }, 
    lastname: { type: String, required: true }, 
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    contact_no: { type: String, default: '' },
    location: { type: String, required: true },
    authtoken: { type: String, default: '' },
    devicetoken: { type: String, default: '' },
    devicetype: { type: String, default: '' },
    social_id: {type: String, default: ''},
    profile_img: {type:String, default: ''},
    block_status: { type: Number, default: 0 },  // 0 means pending 1 active 2 inactive
    role: {   type: String, default: "user"},

    // email_verified: { type: Boolean, default: false },    
    // block: { type: Boolean, default: false },
    // login_type: { type: String, enum:['normal','fb'] ,default: 'normal' },   
}, {
        timestamps: true
    });

UserSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
    user.email = user.email.toLowerCase();
});

UserSchema.methods.comparePassword = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model("User", UserSchema);
