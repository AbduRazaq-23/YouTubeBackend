import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

import {
  registerUser,
  logInUser,
  logOutUser,
  refreshAndAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controller.js";

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

//@dec secure route
router.route("/logOut").post(verifyJWT, logOutUser);
router.route("/token").post(refreshAndAccessToken);
router.route("/changePassword").post(verifyJWT, changeCurrentPassword);
router.route("/getcurrentuser").get(verifyJWT, getCurrentUser);
router.route("/updatedetails").patch(verifyJWT, updateAccountDetails);
router
  .route("/updateavatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/updatecoverimage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

// router
//   .route("/updatecoverimage")
//   .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
export default router;
