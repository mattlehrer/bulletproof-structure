import { UnauthorizedError } from 'express-jwt';

function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    next(err);
  } else if (err instanceof UnauthorizedError) {
    res.status(401);
    res.json({ code: err.code, message: err.message });
  } else {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      // we only add a `stack` property in non-production environments
      ...(process.env.NODE_ENV === 'production' ? null : { stack: err.stack }),
    });
  }
}

export default errorMiddleware;
