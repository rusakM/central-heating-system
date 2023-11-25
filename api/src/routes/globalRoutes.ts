import { Router } from "express";

import boardRouter from "./boardRouter";
import homeRouter from "./homeRouter";
import userRouter from "./userRouter";

const router: Router = Router();

router.use("/boards", boardRouter);
router.use("/home", homeRouter);
router.use("/users", userRouter);

export default router;
