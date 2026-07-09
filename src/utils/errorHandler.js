class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  if (err.name === 'ValidationError' || (err.errors && Array.isArray(err.errors))) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors;
  }

  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry – job_uuid or sm8_account_uuid may already exist';
  }

  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = 'Something went wrong';
    errors = null;
  }

  if (statusCode >= 500) {
    console.error('❌ Server Error:', err.stack || err);
  } else {
    console.warn('⚠️ Client Error:', err.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

module.exports = { AppError, errorHandler };