import express from 'express';
import { protect } from '../middleware/auth.js';
import { addCar, changeRoleRoOwner } from '../controllers/ownerController.js';
import upload from '../middleware/multer.js';

const ownerRouter = express.Router();

ownerRouter.post("/change-role",protect, changeRoleRoOwner)
ownerRouter.post("/add-car",upload.single("image"), protect, addCar)

export default ownerRouter;