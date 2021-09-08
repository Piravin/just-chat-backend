import { Schema, model } from "mongoose";
import { User } from "./types";

const schema = new Schema<User>({
    _id: Schema.Types.ObjectId,
    name: {
        type: String, required: true
    },
    email: {
        type: String, required: true
    },
    password: {
        type: String, required: true
    },
    profile: {
        type: String, required: false
    }
}, {
    timestamps: true,
    collection: "users"
});

export default model<User>('User', schema);