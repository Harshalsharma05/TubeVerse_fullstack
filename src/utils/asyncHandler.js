const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
    }
}

// The asyncHandler function is a utility in Express.js that simplifies error handling in asynchronous route handlers. 
// It wraps any async function (like controllers) and ensures that if a promise is rejected or an error is thrown, 
// it’s automatically caught and passed to the next middleware using next(err). 
// This approach avoids repetitive try-catch blocks in each route, improving code readability and maintainability

export { asyncHandler }



// NOTES:
// Normally, if an async function throws an error inside a route, 
// Express won’t catch it automatically unless you use try/catch in every route. That’s repetitive.
// Instead, you wrap your route handler with asyncHandler(), and it catches errors for you — clean, reusable.

// app.get('/user', asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id);
//   res.json(user);
// }));

// If there's an error (e.g. DB down, invalid ID), 
// asyncHandler will catch it and send a proper response instead of crashing your server.


// const asyncHandler = (func) => () => {} // higher-order function (a function that returns another function)
// const asyncHandler = (func) => async () => {}

// other way to write asyncHandler (using try catch):
/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}
*/