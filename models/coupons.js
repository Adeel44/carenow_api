var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CouponSchema = new mongoose.Schema({
    category_id: { type: Schema.Types.ObjectId, required: true, ref: "Category" },
    coupon_name: { type: String, required: true },
    coupon_description: { type: String, required: true },
    coupon_image: { type: String, default: 'defaultcoupon.png' },
    barcode_image: { type: String, required: true },
    barcode_id: { type: String, required: true},
    original_price: { type: String, required: true },
    discount_percent: { type: String, required: true },
    discount_price: { type: String, required: true },
    cashback_percent: { type: Number, required: true },
    address: { type: String, required: true },
    address_lat: { type: String, required: true },
    address_long: { type: String, required: true },
    expire_date: { type: String, required: true },
    block: { type: Boolean, default: false }
}, {
        timestamps: true
    });

module.exports = mongoose.model("Coupon", CouponSchema);