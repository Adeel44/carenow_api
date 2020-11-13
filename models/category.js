var mongoose = require("mongoose");

var CategorySchema = new mongoose.Schema({
    category_name: { type: String, required: true },
    category_icon: { type: String, required: true },
    block: { type: Boolean, default: false }
}, {
        timestamps: true
    });

module.exports = mongoose.model("Category", CategorySchema);