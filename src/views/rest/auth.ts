import {Router, Request, Response} from "express";
import {verifyUser} from "../../controllers/auth";

var router = Router();

router.get('/verify', async (req: Request, res: Response) => {
    const id: string = req.query.id?.toString() || "";
    const code: string = req.query.code?.toString() || "";
    const verified = await verifyUser(id, code);
    if (verified) {
        res.send("Thank you. Your account has been verified. Engoy just_chat :)");
    } else {
        res.send("Sorry, something went wrong. :(");
    }
});

export default router;