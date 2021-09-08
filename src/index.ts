import express from "express";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({path: __dirname+'\\.env'});
const app = express();
const PORT = process.env.PORT!;
const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING!;

mongoose.connect(MONGODB_CONNECTION_STRING)
    .then(() => console.log("connected to mongodb"))
    .catch(err => console.log(`Error connecting to mongodb ${err}`));

app.listen(PORT, () => {
    console.log("Running express server in http://localhost:" + PORT);
});