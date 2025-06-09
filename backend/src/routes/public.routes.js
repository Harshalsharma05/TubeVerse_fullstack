import { Router } from "express";
import { getChannelStatsByUserId } from "../controllers/public.controller.js";

const router = Router();

router.route("/videos/:userId").get(getChannelStatsByUserId);


export default router;