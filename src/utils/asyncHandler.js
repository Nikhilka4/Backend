const asynHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(
      (err) => next(err)
      //     {
      //     res.status(err.status || 500).json({
      //         success: false,
      //         message: err.message
      //     })
      // }
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
