import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';

/**
 * Socket.io authentication middleware
 * Verifies JWT token from handshake auth or query, attaches user & userType to socket object.
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1] ||
      socket.handshake.query?.token;

    if (!token) {
      const err = new Error('Authentication error: Token not provided');
      err.data = { code: 'UNAUTHORIZED' };
      return next(err);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = await User.findById(decoded.id).select('-password');
    let userType = 'User';

    if (!user) {
      user = await Worker.findById(decoded.id).select('-password');
      userType = 'Worker';
    }

    if (!user) {
      const err = new Error('Authentication error: User no longer exists');
      err.data = { code: 'USER_NOT_FOUND' };
      return next(err);
    }

    socket.user = user;
    socket.userType = userType;
    socket.authenticatedAt = new Date();
    socket.isAlive = true;

    next();
  } catch (error) {
    const err = new Error('Authentication error: Invalid or expired token');
    err.data = { code: 'INVALID_TOKEN', detail: error.message };
    next(err);
  }
};
