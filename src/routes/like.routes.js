import { Router } from "express";

const router = Router();

import { toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/:videoId").post(verifyJWT, toggleVideoLike);

export default router;
