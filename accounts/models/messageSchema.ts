import { Schema, model } from "mongoose";
import { Message } from "./types";

const schema = new Schema<Message>({
    _id: Schema.Types.ObjectId,
    messageType: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: false
    },
    text: {
        type: String,
        required: true
    },
    from: Schema.Types.ObjectId,
    to: Schema.Types.ObjectId
}, {
    timestamps: true,
    collection: 'messages'
});

export default model('Message', schema);