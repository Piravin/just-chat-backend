import UserModel from "../models/userSchema";
import {User} from "../models/types";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { MailInfo } from "./types";
import ejs from "ejs";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class Emailer {

    /**
     * This class handles the emails to be set for user verification
     */

    private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

    constructor() {

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_TOKEN
            },
        });
    }

    async sendMail(content: MailInfo) {
        let info = await this.transporter.sendMail({...content});
        return info;
    }

    async readFromTemplate(template: string, content: any) {
        const template_path = path.join(__dirname,'..','views', template);
        console.log(template_path);
        let htmlContent!: string;
        await ejs.renderFile(template_path, {...content}, (err, data) => {
            if (err) {
                console.error(err);
                throw new Error(err.message);
            } else {
                htmlContent = data
                return data;
            }
        });
        return htmlContent;
    }
}

export async function SignUp(input: User): Promise<void> {

    // Check whether email id is already taken
    const userExists = await UserModel.findOne({email: input.email})
                        .then(res => {return res;}).catch(console.error);
    
    if (userExists != null) {
        throw new Error("User Allready exists");
    }

    // Start creating the new user
    const user = new UserModel({...input, verified: false});
    
    /** Generating verification code */
    let hash = await bcrypt.hash(user.id, Number(process.env.BCRYPT_SALT));

    /**
     * Send verification email using the email builder
    */
    const mailDirector = new Emailer();

    // Write email using ejs template
    const htmlContent = await mailDirector.readFromTemplate("email.ejs", {
        link: `${process.env.SERVER_NAME}/auth/verify?id=${user.id}&code=${hash}`
    }).then(data=>{
        return data;
    }).catch(err=>console.error(err));

    const mailResponse = await mailDirector.sendMail({
        from: "piravin.virtual@gmail.com",
        to: user.email,
        subject: "Account verification",
        text: "",
        html: htmlContent || ""
    });
    // Finidhed handling email verification
    
    /**
     * Save the user info into the database with 
     * verified = false
     */
    await user.save();

}


export async function verifyUser(id:string, code: string) {
    
    /**
     * Handle user verification after the user clicks the 
     * link sent through email
     */

    const match = await bcrypt.compare(id, code);
    if (match) {
        const user = await UserModel.findById(id).then(data=>(data)).catch(console.error);
        
        if (user == null || user == undefined) return false;

        user.verified = true;
        await user.save();
        return true;
    } else return false;
}


export async function loginUser(email: string, password: string, res: any) {

    /**
     * Handle user authentication
     * and set JWT for further authorization
     */

    const [user, error] = await UserModel.findOne({email: email})
                                .then(data=>{
                                    return [data, null];
                                }).catch(err => {
                                    return [null, err];
                                });
    
    // Check whether user exists and is verified
    if (error === null && user.verified) {

        // Compare password hashes with the one stored in database
        const authenticated = await bcrypt.compare(password, user.password);

        // Set the JWT token as a cookie if authenticated
        if (authenticated) {

            const token = await jwt.sign(user.id, process.env.JWT_SECRET!);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 7 // -> 7 days
            })

            return {
                code: 200,
                success: true,
            };
        }
    }

    /* Return unauthorized if 
        - user has not verified email
        - email and password don't match
        - user does not exist
    */
    return {
        code: 401,
        success: false
    };

}


export async function verifyAuth(token: string) {

    /**
     * This function is used to verify JWT
     * to perform authorization of user at various stages
     */
    try {

        const result = await jwt.verify(token, process.env.JWT_SECRET!);
        
        console.log(`User ${result} is logged in`);
        
        return {
            code: 200,
            success: true
        }

    } catch (err) {

        return {
            code: 401,
            success: false
        }

    }
}