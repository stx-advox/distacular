"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.run = void 0;
var transactions_1 = require("@stacks/transactions");
var discord_js_1 = require("discord.js");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var mongoose_1 = require("mongoose");
var tx_1 = require("./schemas/tx");
var cross_fetch_1 = __importDefault(require("cross-fetch"));
var credentials = process.env.CERT_FILE_PATH;
var client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
    ]
});
client.login(process.env.DISCORD_BOT_TOKEN);
client.on("interactionCreate", function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var commandData, subcommand, options, recipient, amount, member, res, data, amountInuSTX, tx;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!interaction.isCommand())
                    return [2 /*return*/];
                commandData = interaction.options.data;
                subcommand = commandData[0];
                if (!(subcommand.name === "send_stx")) return [3 /*break*/, 5];
                options = subcommand.options;
                recipient = options.find(function (item) { return item.name === "recipient"; });
                amount = options.find(function (item) { return item.name === "amount"; });
                member = interaction.member;
                return [4 /*yield*/, interaction.deferReply({ ephemeral: true })];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, cross_fetch_1["default"])("".concat(process.env.STACKS_URL, "/v1/names/").concat(member.nickname))];
            case 2:
                res = _a.sent();
                return [4 /*yield*/, res.json()];
            case 3:
                data = _a.sent();
                amountInuSTX = amount.value * 1e6;
                tx = new tx_1.SendSTX({
                    recipient: recipient.value,
                    amount: amountInuSTX,
                    postConditions: [
                        (0, transactions_1.serializePostCondition)((0, transactions_1.makeStandardSTXPostCondition)(data.address, transactions_1.FungibleConditionCode.Equal, Number(amountInuSTX))),
                    ]
                });
                return [4 /*yield*/, tx.save()];
            case 4:
                _a.sent();
                interaction.editReply({
                    content: "Sending ".concat(amount.value, " STX to ").concat(recipient.value)
                });
                console.log(tx.id);
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); });
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, mongoose_1.connect)(process.env.MONGO_URI, {
                            sslKey: credentials,
                            sslCert: credentials
                        })];
                case 1:
                    _a.sent();
                    console.log("connected!");
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.run = run;
