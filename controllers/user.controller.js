const uuid = require("uuid").v4;
const crypto = require("crypto");

function success(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

function error(res, message, status = 400) {
  res.status(status).json({ success: false, error: message });
}

function generateRoomCode(length = 6) {
  let code = '';
  while (code.length < length) {
    code += crypto.randomInt(0, 10).toString();
  }
  return code;
}

class User {
  constructor(username) {
    this.username = username;
    this.roomName = generateRoomCode();
    this.userId = uuid();
  }
}

class UserController {
  async addUser(req, res) {
    try {
      const { username } = req.body;

      if (!username) {
        return error(res, "Username is required", 400);
      }

      const user = new User(username);

      return success(res, user, 201);
    } catch (err) {
      console.log(err);
      return error(res, err.message || "Failed to create user", 500);
    }
  }
}

module.exports = new UserController();
