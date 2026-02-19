const { StatusCodes } = require('http-status-codes')

const errorMiddleware = (err,req,res,next)=>{
        createCustomError = {
            message : err.message || 'INTERNAL SERVER ERROR',
            statusCode : err.statusCodes || StatusCodes.INTERNAL_SERVER_ERROR
        }
        res.status(createCustomError.statusCode).json({message:err.message})

}


module.exports = errorMiddleware;