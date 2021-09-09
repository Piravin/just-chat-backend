import express, {Request, Response} from "express";
import {ApolloServer} from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core/dist/plugin/drainHttpServer";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import typeDefs from "./views/graphql/schema";
import resolvers from "./views/graphql/resolvers";

class EnvironmentBuilder {

    /**
     * This class builds the environment required
     * to run the server and starts the express server
     * with a graphql endpoint at '/'
     */
    
    private PORT!: string;
    private MONGODB_CONNECTION_STRING!: string;
    public db!: mongoose.Connection;
    public app!: express.Application;

    configureEnvironment() {
        /** Loads .env files and sets environment variables */
        dotenv.config({path: __dirname+'\\.env'});
        this.PORT = process.env.PORT!;
        this.MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING!;
    }

    connectDatabase() {
        /** Connect to mongodb server */
        mongoose.connect(this.MONGODB_CONNECTION_STRING)
        .then(() => console.log("connected to mongodb"))
        .catch(err => console.log(`Error connecting to mongodb ${err}`));
    }

    attachMiddleware(middleware: () => (req: Request, res: Response) => Response) {
        /** Implements express().use */
        this.app.use(middleware());
    }
    
    async createGraphQLServer(typeDefs: any, resolvers: any) {
        const app = express();
        app.use(cors());
        const httpServer = http.createServer(app);
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            plugins: [ApolloServerPluginDrainHttpServer({httpServer})]
        });
        await server.start();
        server.applyMiddleware({app, path: '/'});
        await new Promise<void>((resolve, _) => httpServer.listen({port: this.PORT}, () => {
            console.log("Entered apollo server");
            resolve();
        }));
        console.log("Server running at port:" + this.PORT);
    }
}

(function main() {
    /** Director for Environment Builder */
    const Environment = new EnvironmentBuilder();
    Environment.configureEnvironment();
    Environment.connectDatabase();
    Environment.createGraphQLServer(typeDefs, resolvers);
})();