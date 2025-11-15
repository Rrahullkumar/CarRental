import express from 'express';
import { protect } from '../middleware/auth.js';
import { addCar, changeRoleRoOwner, deleteCar, getDashboardData, getOwnerCars, toggleCarAvailability, updateuserImage } from '../controllers/ownerController.js';
import upload from '../middleware/multer.js';

const ownerRouter = express.Router();

ownerRouter.post("/change-role",protect, changeRoleRoOwner)
ownerRouter.post("/add-car",upload.single("image"), protect, addCar)
ownerRouter.get("/cars", protect,  getOwnerCars)
ownerRouter.post("/toggle-car", protect, toggleCarAvailability)
ownerRouter.post("/delete-car", protect, deleteCar)

ownerRouter.get("/dashboard", protect, getDashboardData)
ownerRouter.post("/update-image", protect, upload.single("image"), protect, updateuserImage)


export default ownerRouter;