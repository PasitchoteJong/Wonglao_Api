// import { ZodError } from "zod";

export default function (err, req, res, next) {

    console.error(err);

    const statusCode = parseInt(err.statusCode || err.status || 500, 10);

    res.status(isNaN(statusCode) ? 500 : statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
}