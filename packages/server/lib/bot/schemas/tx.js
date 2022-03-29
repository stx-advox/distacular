"use strict";
exports.__esModule = true;
exports.SendSTX = void 0;
var mongoose_1 = require("mongoose");
var schema = new mongoose_1.Schema({
    postConditions: { required: false, type: [Buffer] },
    amount: { required: false, type: Number },
    recipient: { required: false, type: String }
});
exports.SendSTX = (0, mongoose_1.model)("SendSTX", schema);
