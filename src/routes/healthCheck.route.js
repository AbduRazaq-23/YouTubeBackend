import { Router } from "express";

const router = Router();
import { healthcheck } from "../controllers/healthCheack.controller.js";

router.route("/healthcheck").get(healthcheck);

export default router;
