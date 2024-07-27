import { Router } from "express";
const router = Router();
import {
  createCommunityPost,
  getCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
} from "../controllers/community.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/").post(verifyJWT, createCommunityPost);
router.route("/").get(getCommunityPost);
router.route("/:contentId").patch(verifyJWT, updateCommunityPost);
router.route("/:contentId").delete(verifyJWT, deleteCommunityPost);

export default router;
