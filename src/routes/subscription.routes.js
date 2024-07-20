import { Router } from "express";
const router = Router();
import { toggleSubscription } from "../controllers/subscribe.controller.js";

router.route("/subscrptiontoggle/:channelId").post(toggleSubscription);

export default router;
