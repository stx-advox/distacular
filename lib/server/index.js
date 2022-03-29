"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var bot_1 = require("./bot");
var api_1 = require("./routers/api");
var port = process.env.PORT || 8244;
var app = (0, express_1["default"])();
app.use("/api", api_1.apiRouter);
app.use("*", function (request, response) {
    response.sendFile(path_1["default"].resolve(__dirname, "index.html"));
});
(0, bot_1.run)()["catch"](console.dir);
app.listen(port);
