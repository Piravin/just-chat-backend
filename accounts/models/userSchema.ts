import { Schema, model } from "mongoose";
import { User } from "./types";
import bcrypt from "bcrypt";

const schema = new Schema<User>({
    name: {
        type: String, required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String, required: true
    },
    profile: {
        type: String, required: false
    },
    verified: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: "users"
});

schema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();

    const hash = await bcrypt.hash(this.password, Number(process.env.BCRYPT_SALT));
    this.password = hash;
    next();
});

export default model<User>('User', schema);