import { Router } from "express";
import { compareRoomsController } from "./room.compare.controller";

const router = Router();

router.get("/compare", compareRoomsController);

export default router;
