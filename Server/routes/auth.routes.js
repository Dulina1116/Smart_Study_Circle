const express = require("express");
const router = express.Router();

const { loginUser } = require("../controllers/auth.controller");
const validateLogin = require("../middleware/validateLogin");

// POST /api/auth/login
router.post("/login", validateLogin, loginUser);

module.exports = router;
