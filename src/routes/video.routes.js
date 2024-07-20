import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  deleteVideo,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/uploadvideo").post(
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "videoTitle", maxCount: 1 },
  ]),
  publishAVideo
);
router
  .route("/updatevideo/:videoId")
  .patch(upload.single("thumbnail"), updateVideo);

router.route("/deletevideo/:videoId").delete(deleteVideo);
router.route("/getvideo/:videoId").get(getVideoById);
router.route("/togglePublish/:videoId").post(togglePublishStatus);

export default router;
