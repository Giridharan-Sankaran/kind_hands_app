const ApiError = require("../utils/ApiError");

// Converts any error thrown/forwarded in the app into a consistent,
// human-readable JSON response. Never leaks stack traces or raw driver
// errors to the client.
function errorHandler(err, req, res, _next) {
  let statusCode = 500;
  let message = "We couldn't complete that action right now. Please try again.";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ");
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || { field: 1 })[0];
    message =
      field === "email"
        ? "An account with this email already exists."
        : "That value is already in use.";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "That request wasn't formatted correctly.";
  }

  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({ success: false, message });
}

function notFound(req, _res, next) {
  next(new ApiError(404, "That endpoint doesn't exist."));
}

module.exports = { errorHandler, notFound };
