const ErrorHandler = require("../utils/errorHandler");

module.exports =(err,req,res,next) =>{
    err.statusCode = err.statusCode || 404;
    err.message = err.message || "Internal Server Error ";

    //wrong mongodh id error
    if(err.name ==="CastError")
    {
        const  message =`Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message,400);
    }
    //mongoose duplicate key error
    if(err.code ===11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message,404);
    }
    //wrong jwt token error
    if(err.name ==="JsonWebTokenError")
    {
        const  message =`Json Web Token is invalid, Try again`;
        err = new ErrorHandler(message,400);
    }
    //jwt expire error
    if(err.name ==="TokenExpiredError")
    {
        const  message =`Json Web Token is Expired, Try again}`;
        err = new ErrorHandler(message,400);
    }
    res.status(err.statusCode).json({
        success: false,
        message:err.message,
    });
};