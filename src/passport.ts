import passport from "passport";
import passportJWT from "passport-jwt";
import { Student } from "./entity/Student";
import { ExpiredToken } from "./entity/ExpiredToken";
import { College } from "./entity/College";

const setupJWT = () => {
  const JWTStrategy = passportJWT.Strategy;
  const ExtractJWT = passportJWT.ExtractJwt;

  passport.use(
    "access",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          if (jwtPayload.exp < new Date().getTime()) {
            return done("Expired");
          }
          const user = await Student.findOneOrFail({
            email: jwtPayload.sub,
          });

          const college = await College.findOneOrFail({
            id: user.college_id as unknown as number,
          });

          user.college = college;
          
          if (process.env.NODE_ENV !== "development" && !user.verified) {
            return done("Unverified");
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  passport.use(
    "refresh",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromBodyField("refreshToken"),
        secretOrKey: process.env.REFRESH_TOKEN_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          if (jwtPayload.exp < new Date().getTime()) {
            return done("Refresh token is expired");
          }
          return done(null, {email: jwtPayload.sub});
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};

function accessMiddleware(req: any, res: any, next: Function) {
  passport.authenticate('access', { session: false }, function(err, user) {
    if (err || user == false){
      return res.sendStatus(401);
    }
    req.user = user;
    next();
  })(req, res, next);
}

function refreshMiddleware(req: any, res: any, next: Function) {
  passport.authenticate('refresh', { session: false },async function(err, user){

    if (err || user == false){ 
      return res.sendStatus(401);
    }
    
    const refreshToken = req.body.refreshToken;
    if (await ExpiredToken.findOne({ token: refreshToken })) {
      return res.sendStatus(401);
    }

    req.user = user;
    next();
  })(req, res, next);
}

export { setupJWT, accessMiddleware, refreshMiddleware };
