import express from "express";
import { createUser,getUserByUid,getLevels,updateUser,addToFavorites} from "../controllers/userController.js";

const router = express.Router();


router.post("/", createUser);

//getting all the levels (for testing pourpse)
router.get("/levels",getLevels)


// get user by using the token (UID)
router.get("/:uid" , getUserByUid)

//update the user profile of the logged in user 

router.put("/update/:uid" ,updateUser)

//user add recips in to the fav array (pass the _id --> we will be uisng findbyId so must pass the built in id for the recipe objcet from the fronted )

router.put("/favorites/:uid" , addToFavorites)







export default router;