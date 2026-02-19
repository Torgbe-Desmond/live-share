const mongoose = require("mongoose");
const crypto = require("crypto");

const Directory = require("../models/directory.model");
const File = require("../models/file.model");
const User = require("../models/user.model");
const JwtTokenUtility = require("../utils/token.utility");

class UserService {
  constructor() {}

  // 🔐 Better random string (secure)
  generateRandomString(length = 8) {
    return crypto
      .randomBytes(length)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, length);
  }

  async addUser(username) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const roomName = this.generateRandomString(5);

      const [newUser] = await User.create(
        [{ username, roomName }],
        { session }
      );

      // const expiresAtUtc = new Date(Date.now() + 60 * 60 * 1000);

      // const accessToken = JwtTokenUtility.generateAccessToken(
      //   newUser._id,
      //   expiresAtUtc
      // );

      await session.commitTransaction();
      session.endSession();

      return {
        userId: newUser._id,
        username: newUser.username,
        // accessToken,
        // expiresAtUtc,
        roomName,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async deleteUser(userId) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await File.deleteMany({ userId }, { session });
      await Directory.deleteOne({ userId }, { session });
      await User.deleteOne({ _id: userId }, { session });

      await session.commitTransaction();
      session.endSession();

      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

module.exports = UserService;