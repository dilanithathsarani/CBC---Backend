import express from 'express';
import {changePassword, deleteUser, getAllUsers, getCurrentUser, googleLogin, loginUser, saveUser, sendOTP, toggleUserStatus} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/",saveUser)
userRouter.post("/login", loginUser);
userRouter.post("/google",googleLogin);
userRouter.get("/current", getCurrentUser);
userRouter.post("/sendMail", sendOTP);
userRouter.post("/changePW", changePassword);
userRouter.get("/all", getAllUsers);
userRouter.put("/toggle/:id",toggleUserStatus);
userRouter.delete("/:id", deleteUser); 

export default userRouter;