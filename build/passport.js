"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = __importDefault(require("passport-jwt"));
const Student_1 = require("./entity/Student");
const ExpiredToken_1 = require("./entity/ExpiredToken");
const College_1 = require("./entity/College");
const setupJWT = () => {
    const JWTStrategy = passport_jwt_1.default.Strategy;
    const ExtractJWT = passport_jwt_1.default.ExtractJwt;
    passport_1.default.use("access", new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    }, (jwtPayload, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (jwtPayload.exp < new Date().getTime()) {
                return done("Expired");
            }
            const user = yield Student_1.Student.findOneOrFail({
                email: jwtPayload.sub,
            });
            const college = yield College_1.College.findOneOrFail({
                id: user.college_id,
            });
            user.college = college;
            if (process.env.NODE_ENV !== "development" && !user.verified) {
                return done("Unverified");
            }
            return done(null, user);
        }
        catch (err) {
            return done(err);
        }
    })));
    passport_1.default.use("refresh", new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromBodyField("refreshToken"),
        secretOrKey: process.env.REFRESH_TOKEN_SECRET,
    }, (jwtPayload, done) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (jwtPayload.exp < new Date().getTime()) {
                return done("Refresh token is expired");
            }
            return done(null, { email: jwtPayload.sub });
        }
        catch (err) {
            return done(err);
        }
    })));
};
exports.setupJWT = setupJWT;
function accessMiddleware(req, res, next) {
    passport_1.default.authenticate('access', { session: false }, function (err, user) {
        if (err || user == false) {
            return res.sendStatus(401);
        }
        req.user = user;
        next();
    })(req, res, next);
}
exports.accessMiddleware = accessMiddleware;
function refreshMiddleware(req, res, next) {
    passport_1.default.authenticate('refresh', { session: false }, function (err, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (err || user == false) {
                return res.sendStatus(401);
            }
            const refreshToken = req.body.refreshToken;
            if (yield ExpiredToken_1.ExpiredToken.findOne({ token: refreshToken })) {
                return res.sendStatus(401);
            }
            req.user = user;
            next();
        });
    })(req, res, next);
}
exports.refreshMiddleware = refreshMiddleware;
//# sourceMappingURL=passport.js.map