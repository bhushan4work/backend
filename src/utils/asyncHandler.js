const asyncHander = () => {} //method

//meth1- using promises
const asyncHandler  = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next )).catch((err) => next(err))
    }
}

export {asyncHander} //export the method above 



//meth2- using try& catch
// higher order fxn: fxn that takes another fxn as an argument and possibly returns a new fxn
// const asyncHandlerr = (fxn) => async  (req,res,next) => {
//     try {
//         await fxn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             message: error.message
//         })
//     }
// }
