"use strict";
exports.__esModule = true;
exports.apiRouter = void 0;
var express_1 = require("express");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.get("/get-tx/:txId", function (req, res) {
    req.params.txId;
});
