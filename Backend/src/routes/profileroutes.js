import express from "express"
import{
    getProfile,
    updateProfile,
    updatePassword,
    deleteProfile,
} from "../controllers/profilecontroller.js";

const router = express.Router();

router.get("/getProfile", getProfile);
router.put("/updateProfile", updateProfile);
router.put("/updatePassword", updatePassword);
router.delete("/deleteProfile", deleteProfile);


export default router;
