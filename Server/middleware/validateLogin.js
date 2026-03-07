module.exports = function validateLogin(req, res, next) {
  const { email, password } = req.body;

  // Check missing fields
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  next();
};
