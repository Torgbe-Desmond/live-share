require("dotenv").config();
const jwt = require("jsonwebtoken");
const JwtTokenUtility = require("../utility/token.utility");
const UserService = require("../services/user.service");

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
const userRepository = new UserService();

class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.name = "Unauthorized";
    this.status = 401;
  }
}

// 1. Basic JWT authentication (attach user to req)
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new Unauthorized("Authentication token required"));
  }

  try {
    const decoded = JwtTokenUtility.verifyToken(token);
    const user = await userRepository.getByIdAsync(decoded.userId);

    if (!user) {
      return next(new Unauthorized("User not found"));
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (err) {
    return next(new Unauthorized("Invalid or expired token"));
  }
};

module.exports = {
  authenticate,
};
