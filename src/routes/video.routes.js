import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getVideoById,
  publishAVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/uploadvideo").post(
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "videoTitle", maxCount: 1 },
  ]),
  publishAVideo
);

router.route("/getvideo/:videoId").get(getVideoById);

export default router;
