import * as authService from '../services/authService.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Must be true when sameSite is 'none'
  sameSite: 'none', // Critical for cross-domain Vercel -> Render requests
  maxAge: 24 * 60 * 60 * 1000 // Exact 24 Hour runtime window
};

export const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'All payload parameters must be explicitly populated.' }
      });
    }

    const createdUserData = await authService.registerNewUser(email, password, role);

    return res.status(201).json({
      success: true,
      data: createdUserData,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An identity with this email is already registered.' }
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message }
      });
    }
    next(error); // Let global error boundary handling catch downstream faults
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Credentials parsing error: properties missing.' }
      });
    }

    const loginDataResult = await authService.validateUserCredentials(email, password);

    // Secure Out-of-band JWT assertion execution via HttpOnly cookie injection node
    res.cookie('token', loginDataResult.token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      data: { user: loginDataResult.user },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'The credentials supplied could not be authenticated.' }
      });
    }
    if (error.message === 'ACCOUNT_SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Access denied. This profile identity has been flagged.' }
      });
    }
    next(error);
  }
};

export const logout = async (req, res) => {
  // Clear the token reference out of client processing frameworks instantly
  res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 });
  return res.status(200).json({
    success: true,
    data: { message: 'Session dropped successfully. Account pipeline clean.' },
    meta: { timestamp: new Date().toISOString() }
  });
};
