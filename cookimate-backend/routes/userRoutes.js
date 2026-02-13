import express from "express";
import { createUser,getUserByUid,getLevels,updateUser} from "../controllers/userController.js";

const router = express.Router();


router.post("/", createUser);

//getting all the levels (for testing pourpse)
router.get("/levels",getLevels)


// get user by using the token (UID)
router.get("/:uid" , getUserByUid)

//update the user profile of the logged in user 

router.put("/update/:uid" ,updateUser)







export default router;