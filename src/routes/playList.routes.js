import { Router } from "express";

const router = Router();

import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/").post(verifyJWT, createPlaylist);
router.route("/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/:playlistId/:videoId").patch(addVideoToPlaylist);
router.route("/:playlistId/:videoId").delete(removeVideoFromPlaylist);
router.route("/:playlistId").delete(deletePlaylist);
router.route("/:playlistId").patch(updatePlaylist);

export default router;
