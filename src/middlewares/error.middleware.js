import { ZodError } from "zod";

export default function (err,req,res,next){
    
    
    const statusCode = err.status || 500;
    return res.status(statusCode).json({
        error: err.name || 'Internal Server Error',
        message:err.message || 'Something went wrong on the Server.'
    });
}