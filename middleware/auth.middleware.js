require("dotenv").config();
const jwt = require("jsonwebtoken");
const JwtTokenUtility = require("../utility/token.utility");
const UserService = require("../services/user.service");

const JWT_SECRET = process.env.JWT_ACCESvS_SECRET;
const userRepository = new UserService();

// 1. Basic JWT authentication (attach user to req)
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new Unauthorized("Authentication token required"));
  }

  try {
    const decoded = JwtTokenUtility.verifyToken(token);
    const user = await userRepository.getByIdAsync(decoded.userId);
    let restaurantId = null;

    if (user.role == "restaurant_staff") {
      await restaurantRepository
        .getByUserIdAsync(decoded.userId)
        .then((data) => {
          restaurantId = data.id;
        });
    }

    if (!user) {
      return next(new Unauthorized("User not found"));
    }

    req.user = {
      userId: user.id,
      role: user.role,
      restaurantId,
    };

    next();
  } catch (err) {
    return next(new Unauthorized("Invalid or expired token"));
  }
};

module.exports = {
  authenticate,
};
