import jwt from 'jsonwebtoken';

/**
 * Explicit Authentication Core Guard Gate
 */
export const authenticateUser = async (req, res, next) => {
  let token = req.cookies.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED_ACCESS', message: 'Missing systemic session validation token.' }
    });
  }

  try {
    const verifiedPayload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Inject structural authorization pointers explicitly into request context
    req.user = {
      id: verifiedPayload.userId,
      userId: verifiedPayload.userId,
      role: verifiedPayload.role
    };

    next();
  } catch (tokenVerificationError) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_SESSION_TOKEN', message: 'Token signature manipulation or expiration caught.' }
    });
  }
};

/**
 * Structural RBAC Multi-Role Enforcer Factory Interceptor
 */
export const authorizeRoles = (...permittedRoles) => {
  return (req, res, next) => {
    if (!req.user || !permittedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN_PRIVILEGE_VIOLATION', message: 'Your authorization parameters mismatch this operation target.' }
      });
    }
    next();
  };
};
