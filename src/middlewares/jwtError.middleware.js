import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

export default function (err, req, res, next) {
    if (err instanceof jwt.TokenExpiredError) {
        return next(
            createHttpError.Unauthorized('Token expired Please login again')
        )    
    }


    if (err instanceof jwt.JsonWebTokenError) {
        return next(
            createHttpError.Unauthorized('Token is invalid')
        )
    }
    return next(err)
}
