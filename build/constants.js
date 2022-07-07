"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const accessTokenLifespan = 30 * 60 * 1000; // in ms
exports.accessTokenLifespan = accessTokenLifespan;
const refreshTokenLifespan = 14 * 24 * 60 * 60 * 1000; // in ms
exports.refreshTokenLifespan = refreshTokenLifespan;
const HELPER_FEE = 6; // in %
exports.HELPER_FEE = HELPER_FEE;
var Token;
(function (Token) {
    Token[Token["ACCESS"] = 0] = "ACCESS";
    Token[Token["REFRESH"] = 1] = "REFRESH";
})(Token || (Token = {}));
exports.Token = Token;
// TODO: Come up with final number
const simultaneousApplicationLimit = 5;
exports.simultaneousApplicationLimit = simultaneousApplicationLimit;
const simultaneousActiveAssignmentsLimit = 10;
exports.simultaneousActiveAssignmentsLimit = simultaneousActiveAssignmentsLimit;
var socketEventName;
(function (socketEventName) {
    socketEventName[socketEventName["SEND_MESSAGE"] = 0] = "SEND_MESSAGE";
})(socketEventName || (socketEventName = {}));
exports.socketEventName = socketEventName;
var socketFeedback;
(function (socketFeedback) {
    socketFeedback[socketFeedback["FAILED_MESSAGE_CREATION"] = 0] = "FAILED_MESSAGE_CREATION";
    socketFeedback[socketFeedback["MESSAGE_DELIVERED"] = 1] = "MESSAGE_DELIVERED";
    socketFeedback[socketFeedback["INVALID_SENDER_OR_RECIPIENT"] = 2] = "INVALID_SENDER_OR_RECIPIENT";
})(socketFeedback || (socketFeedback = {}));
exports.socketFeedback = socketFeedback;
const ALLOWED_FILE_TYPES = ["jpeg", "png", "pdf"];
exports.ALLOWED_FILE_TYPES = ALLOWED_FILE_TYPES;
//# sourceMappingURL=constants.js.map