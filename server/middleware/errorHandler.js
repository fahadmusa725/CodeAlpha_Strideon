const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already in use`;
  }

  if (err.name === 'CastError') {
    status = 404;
    message = 'Resource not found';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;
