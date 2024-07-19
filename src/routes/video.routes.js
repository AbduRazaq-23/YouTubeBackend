import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { publishAVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/uploadvideo").post(
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "videoTitle", maxCount: 1 },
  ]),
  publishAVideo
);

export default router;
