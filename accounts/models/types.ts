import { ObjectId } from "mongoose";

export interface UserInfo {
    name: string;
    email: string;
    profile: string;
};

export interface User extends UserInfo {
    password: string;
    verified?: boolean;
}

export interface Message {
    _id: ObjectId;
    messageType: string;
    file?: string;
    text: string;
    from: ObjectId;
    to: ObjectId;
}