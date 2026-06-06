// src/controllers/userController.ts
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// ====================== RESPONSE HELPERS ======================

const success = (res: Response, data: any, status: number = 200) => {
  return res.status(status).json({ success: true, data });
};

const error = (res: Response, message: string, status: number = 400) => {
  return res.status(status).json({ success: false, error: message });
};

// ====================== TYPES ======================

interface User {
  username: string;
  roomName: string;
  userId: string;
}

// ====================== HELPER FUNCTIONS ======================

function generateRoomCode(length: number = 6): string {
  let code = "";
  while (code.length < length) {
    code += crypto.randomInt(0, 10).toString();
  }
  return code;
}

// ====================== CONTROLLER ======================

class UserController {
  async addUser(req: Request, res: Response): Promise<Response> {
    try {
      const { username } = req.body;

      if (!username) {
        return error(res, "Username is required", 400);
      }

      const user: User = {
        username,
        roomName: generateRoomCode(),
        userId: uuidv4(),
      };

      return success(res, user, 201);
    } catch (err: any) {
      console.error("AddUser Error:", err);
      return error(res, err.message || "Failed to create user", 500);
    }
  }
}

export default new UserController();
