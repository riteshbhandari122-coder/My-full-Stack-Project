const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shopmart_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  res.cookie('token', token, cookieOptions);
};

module.exports = { generateToken, setTokenCookie };
