import UserModel from "../models/userSchema";
import {User} from "../models/types";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { MailInfo } from "./types";
import ejs from "ejs";
import path from "path";
import bcrypt from "bcrypt";

class Emailer {
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
    const userExists = await UserModel.findOne({email: input.email})
                        .then(res => {return res;}).catch(console.error);
    
    if (userExists != null) {
        throw new Error("User Allready exists");
    }

    const user = new UserModel({...input, verified: false});
    
    /** Generating verification code */
    let hash = await bcrypt.hash(user.id, Number(process.env.BCRYPT_SALT));

    const mailDirector = new Emailer();

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
    
    await user.save();

}

export async function verifyUser(id:string, code: string) {
    // const hash = await bcrypt.hash(id, Number(process.env.BCRYPT_SALT));

    const match = await bcrypt.compare(id, code);
    if (match) {
        const user = await UserModel.findById(id).then(data=>(data)).catch(console.error);
        
        if (user == null || user == undefined) return false;

        user.verified = true;
        await user.save();
        return true;
    } else return false;
}

export async function loginUser(email: string, password: string) {

    const [user, error] = await UserModel.findOne({email: email})
                                .then(data=>{
                                    return [data, null];
                                }).catch(err => {
                                    return [null, err];
                                });
    
    if (error === null) {
        const authenticated = await bcrypt.compare(password, user.password);

        if (authenticated) {
            return {
                code: 200,
                success: true
            };
        }
    }
    
    return {
        code: 401,
        success: false
    };

}