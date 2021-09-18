import {Router, Request, Response} from "express";
import {verifyUser} from "../../controllers/auth";

var router = Router();

router.get('/verify', async (req: Request, res: Response) => {

    /**
     * Handle user's email id verification
     */

    const id: string = req.query.id?.toString() || "";
    const code: string = req.query.code?.toString() || ""; // <- code is the hashed user.id
    const verified = await verifyUser(id, code);
    if (verified) {
        res.send("Thank you. Your account has been verified. Engoy just_chat :)");
    } else {
        res.send("Sorry, something went wrong. :(");
    }
});

export default router;