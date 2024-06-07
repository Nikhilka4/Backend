const asynHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(
      (err) => next(err)
    );
  };
};

export { asynHandler };

//done by using async await
// const asynHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.status || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
