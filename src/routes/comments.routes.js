import { Router } from "express";

const router = Router();

import {
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/:videoId").post(verifyJWT, addComment);
router.route("/:commentId").patch(updateComment);
router.route("/:commentId").delete(deleteComment);

export default router;
