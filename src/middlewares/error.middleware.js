import { ZodError } from "zod";

export default function (err,req,res,next){
    
    console.error(error);

    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
        error: err.name || 'Internal Server Error',
        message:err.message || 'Something went wrong on the Server.'
    });
}