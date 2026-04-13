const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shopmart_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none', // ✅ fixes mobile cross-domain
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
  res.cookie('token', token, cookieOptions);
};

module.exports = { generateToken, setTokenCookie };