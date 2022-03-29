"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importDefault(require("react"));
var react_2 = require("@testing-library/react");
var App_1 = __importDefault(require("./App"));
test('renders learn react link', function () {
    (0, react_2.render)(<App_1["default"] />);
    var linkElement = react_2.screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});
