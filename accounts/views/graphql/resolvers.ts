import { SignUp, loginUser, verifyAuth } from "../../controllers/auth";
import {User} from "../../models/types";

interface UserInput {
    input: User;
}

interface Login {
    email: string;
    password: string;
}

const resolvers = {
    Query: {
        checkCon: (_: any, __: any, {token} : any) => {
            /** Query to check graphql connection */
            return "Hello from graphql" + "  " + token;
        },

        login: async (_: any, {email, password}: Login, {res} : any) => {
            /** Handle user login */
            const result = await loginUser(email, password, res);
            return result;
        },

        verifyAuth: async (_: any, __:any, ctx: any) => {
            /** Handle user authorization */
            const token = ctx.token;
            return await verifyAuth(token);
        }
    },

    Mutation: {
        signUpUser: async (_: any, {input}: UserInput) => {

            /** Validating input */
            let valid = true;

            const validName = (() => input.name.length <= 15)();
            valid &&= validName;

            const validEmail = (() => {
                const EMAIL_REGEX = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
                return EMAIL_REGEX.test(input.email);
            })()
            valid &&= validEmail;

            const validPassword = (() => {
                return input.password.length >= 8 && input.password.length <= 16;
            })()
            valid &&= validPassword;

            valid &&= typeof input.profile == "string";

            /** Creating user after input validation */

            const {user, error} = await SignUp({
                name: input.name,
                email: input.email,
                password: input.password,
                profile: input.profile
            }).then((user) => ({user: user, error: null}))
            .catch((err) => ({user: null, error: err}));

            // Send error message if inputs are not valid
            if (error != null || !valid) {
                return {
                    code: valid ? 500 : 400,
                    success: false,
                    message: valid ? error : 
                        !validName ? "The username is not valid"
                        : !validEmail ? "The email id is not valid"
                        : "The password is not valid"
                };
            }

            // Return success response if inputs are valid and user is created
            return {
                code: 200,
                success: true,
                message: "Please verify your account through the mail we have sent to your registered email id"
            };
        }
    }
};

export default resolvers;