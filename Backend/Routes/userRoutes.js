import express from 'express';
import {signup,login,updateProfile} from "../Controllers/Authcontrollers.js";

import {protectRoute} from "../middlewares/auth.js";
import {checkAuth} from "../Controllers/Authcontrollers.js";
const router = express.Router();
router.post('/signup',signup); 
router.post('/login',login);
router.put("/update-profile",protectRoute,updateProfile);
router.get("/check",protectRoute,checkAuth);

export default router;