import jwt from 'jsonwebtoken';
import ProjectApplication from '../models/ProjectApplication.js';

const LEAKAGE_REGEXES = [
  /[\w\.-]+@[\w\.-]+\.\w{2,4}/gi,                         // Email pattern regex
  /(\+?\d{1,4}[\s-])?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g, // Global phone pattern match
  /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi // URLs
];

export const initializeWebSocketComponent = (io) => {
  // Global Decryption Middleware Handshake
  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) return next(new Error('AUTHENTICATION_ERROR'));

    const token = cookieHeader.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return next(new Error('AUTHENTICATION_ERROR'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('AUTHENTICATION_ERROR'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_room', async ({ applicationId }) => {
      try {
        const application = await ProjectApplication.findById(applicationId);
        if (!application) return socket.emit('error_msg', 'Application tracking mapping reference invalid.');

        // Gated Guard Rule: Block chat room initialization unless status is advanced
        const allowedStatuses = ['SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'ACCEPTED'];
        if (!allowedStatuses.includes(application.status)) {
          return socket.emit('error_msg', 'Access gated. Pipeline state insufficient to start communication channels.');
        }

        socket.join(applicationId);
      } catch (err) {
        socket.emit('error_msg', 'Internal socket state initialization fault.');
      }
    });

    socket.on('send_message', ({ roomId, messageText }) => {
      // Platform Leakage Sanitization Loop Layer
      let scrubbedPayload = messageText;
      LEAKAGE_REGEXES.forEach((pattern) => {
        scrubbedPayload = scrubbedPayload.replace(pattern, '[Sensitive Info Masked - Keep Payments On Trainistry]');
      });

      // Broadcast clean payload down the pipe to room participants safely
      io.to(roomId).emit('receive_message', {
        senderId: socket.user.userId,
        text: scrubbedPayload,
        timestamp: new Date().toISOString()
      });
    });
  });
};
