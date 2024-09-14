module.exports = (asyncFn)=>{
    return(req,res,next)=>{
        console.log('seend')
        asyncFn(req, res, next).catch((err)=>{
            next(err);
        });
    };
};