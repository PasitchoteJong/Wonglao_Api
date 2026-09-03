import createHttpError from "http-errors";
import { verifyToken } from "../utils/jwt.js";

export default async function (req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw createHttpError(401, "Authorization header is required");
        }

        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {
            throw createHttpError(401, "Invalid authorization format");
        }

        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        if (error.status) {
            return next(error);
        }
        return next(createHttpError(401,"Invalid or expired token"))
    }
}