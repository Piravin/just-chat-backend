import { ObjectId } from "mongoose";

export interface User {
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    profile?: string;
}

export interface Message {
    _id: ObjectId;
    messageType: string;
    file?: string;
    text: string;
    from: ObjectId;
    to: ObjectId;
}