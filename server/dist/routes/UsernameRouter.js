"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.router = router;
const validateForm_1 = require("../controllers/validateForm");
router.route('/setUsername')
    .get((req, res) => {
    if (req.session.user && req.session.user.username) {
        res.json({ hasUsername: true, username: req.session.user.username });
    }
    else
        res.json({ hasUsername: false });
})
    .post((req, res) => {
    (0, validateForm_1.validateForm)(req, res);
    req.session.user = {
        username: req.body.username,
        room: ''
    };
    res.json({ hasUsername: true, username: req.session.user.username });
});
