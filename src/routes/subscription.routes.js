import { Router } from "express";
const router = Router();
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscribe.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/:channel").post(verifyJWT, toggleSubscription);
router.route("/:channel").get(getUserChannelSubscribers);
router.route("/getsubscribed/:subscriber").get(getSubscribedChannels);

export default router;
