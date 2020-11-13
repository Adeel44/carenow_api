var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var AdminSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, index: { unique: true } },
    profileimage: { type: String, default: 'default.jpg' },
    password: { type: String, required: true },
    role: {type:String, default: ''}
}, {
        timestamps: true
    });

AdminSchema.pre('save', function (next) {
    var admin = this;
    if (!admin.isModified('password')) return next();

    bcrypt.hash(admin.password, null, null, function (err, hash) {
        if (err) { return next(err); }

        admin.password = hash;
        next();
    });

    admin.email = admin.email.toLowerCase();
});

AdminSchema.methods.comparePassword = function (password) {
    var admin = this;

    return bcrypt.compareSync(password, admin.password);
};

module.exports = mongoose.model("Admin", AdminSchema);
