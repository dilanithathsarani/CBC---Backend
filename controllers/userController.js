import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import { OTP } from "../models/otp.js";
dotenv.config();

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "dilanithathsarani2003@gmail.com",
    pass: "mmcqmmbowvidxsue",
  },
});

export async function saveUser(req, res) {
  try {
    if (req.body.role === "admin") {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
          message: "You are not authorized to create or promote an admin",
        });
      }
    }

    const { email, firstName, lastName, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    // 🔹 EXISTING USER → PROMOTE TO ADMIN
    if (existingUser && role === "admin") {
      if (existingUser.role === "admin") {
        return res.status(400).json({
          message: "User is already an admin",
        });
      }

      existingUser.role = "admin";
      await existingUser.save();

      return res.json({
        message: "User promoted to admin successfully",
      });
    }

    // 🔹 EXISTING USER (NORMAL CASE)
    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // 🔹 NEW USER / NEW ADMIN
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = new User({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role,
    });

    await user.save();

    res.json({
      message: "User saved successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "User not saved",
    });
  }
}

export function loginUser(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then((user) => {
    if (user == null) {
      res.status(404).json({ message: "Invalid email" });
    } else {
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);

      if (isPasswordCorrect) {
        const userData = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          isDisabled: user.isDisabled,
          isEmailVerified: user.isEmailVerified,
        };

        const token = jwt.sign(userData, process.env.JWT_KEY, {
          expiresIn: "48hrs",
        });

        res.json({
          message: "Login successful",
          token,
          user: userData,
        });
      } else {
        res.status(403).json({ message: "Invalid password" });
      }
    }
  });
}

export async function googleLogin(req, res) {
  const accessToken = req.body.accessToken;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: "Bearer " + accessToken },
      }
    );

    const user = await User.findOne({ email: response.data.email });

    if (user == null) {
      const newUser = new User({
        email: response.data.email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        isEmailVerified: true,
        password: accessToken,
      });

      await newUser.save();

      const userData = {
        email: response.data.email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        role: "user",
        phone: "Not given",
        isDisabled: false,
        isEmailVerified: true,
      };

      const token = jwt.sign(userData, process.env.JWT_KEY, {
        expiresIn: "48hrs",
      });

      res.json({
        message: "Login successful",
        token,
        user: userData,
      });
    } else {
      const userData = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        isDisabled: user.isDisabled,
        isEmailVerified: user.isEmailVerified,
      };

      const token = jwt.sign(userData, process.env.JWT_KEY, {
        expiresIn: "48hrs",
      });

      res.json({
        message: "Login successful",
        token,
        user: userData,
      });
    }
  } catch (e) {
    res.status(500).json({ message: "Google login failed" });
  }
}

export function getCurrentUser(req, res) {
  if (req.user == null) {
    return res.status(403).json({
      message: "Please login to get user details",
    });
  }
  res.json({ user: req.user });
}

export function sendOTP(req, res) {
  const email = req.body.email;
  const otp = Math.floor(Math.random() * 9000) + 1000;

  const message = {
    from: "malithdilshan27@gmail.com",
    to: email,
    subject: "OTP for email verification",
    text: "Your OTP is : " + otp,
  };

  const newOtp = new OTP({ email, otp });

  newOtp.save();

  transport.sendMail(message, (err) => {
    if (err) {
      res.status(500).json({ message: "Error sending email" });
    } else {
      res.json({ message: "OTP sent successfully", otp });
    }
  });
}

export async function changePassword(req, res) {
  const { email, password, otp } = req.body;

  try {
    const lastOTPData = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!lastOTPData) {
      return res.status(404).json({ message: "No OTP found for this email" });
    }

    if (lastOTPData.otp != otp) {
      return res.status(403).json({ message: "Invalid OTP" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    await OTP.deleteMany({ email });

    res.json({ message: "Password changed successfully" });
  } catch (e) {
    res.status(500).json({ message: "Error changing password" });
  }
}

export async function getAllUsers(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const users = await User.find().sort({ role: 1, firstName: 1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: "Error fetching users" });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDisabled = !user.isDisabled;
    await user.save();

    res.json({
      message: `User ${user.isDisabled ? "disabled" : "enabled"} successfully`,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating user status" });
  }
}

export async function deleteUser(req, res) {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
}
