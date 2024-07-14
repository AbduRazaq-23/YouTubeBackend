import { Router } from "express";

import {
  registerUser,
  logInUser,
  logOutUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/logIn").post(logInUser);
router.route("/logOut").post(verifyJWT, logOutUser);
router.post("/hi", (req, res) => {
  res.send("Hi");
});

export default router;
