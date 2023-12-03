import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroConfig from "./mikro-orm.config";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import createClient from 'ioredis';
import session from 'express-session';
import cors from 'cors';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
// import { MyContext } from "./types";


const main = async () => {
    // Connect to db
    const orm = await MikroORM.init(mikroConfig);

    // Run migration
    await orm.getMigrator().up();

    const app: any = express();
    const httpServer = http.createServer(app);

    //session cookies for storing login
    const redisClient = new createClient();
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    const RedisStore = require("connect-redis").default;

    app.set("trust proxy", 1);
    app.use(
        cors({
            credentials: true,
            // origin: '*',
            origin: [
                "https://studio.apollographql.com",
                "http://localhost:3000",
                "http://localhost:4000"
            ],
        })
    )
    app.use(
        session({
            name: 'cookieYumYum',
            store: new RedisStore({
                client: redisClient,
                disableTouch: true,
                disableTTL: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: "lax",
                secure: false //cookie only works in https and we want it false for staging
                // sameSite: "lax",
                // secure: __prod__ //cookie only works in https and we want it false for staging
            },
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: false,
        })
    )
    //apollo midleware will use session so code is after 
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        // context: ({ req, res }) => ({ em: orm.em, req, res }),
        context: ({ req, res }) => {
            // Log the request session and other relevant information
            // console.log("Session:", req.session);
            // console.log("Request headers:", req.headers);

            // Return the context object
            return { em: orm.em, req, res };
        },

        // introspection: true,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    // console.log(apolloServer);
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`);

    // await apolloServer.start();
    // app.get('/test-cookie', (__, res) => {
    //     res.cookie('testCookie', 'testValue', { httpOnly: true, sameSite: 'lax', secure: false });
    //     res.send('Cookie set');
    // });

    //test cookie send
    app.get('/', (__, res) => {
        res.cookie('test_name', 'test_value', { httpOnly: true, sameSite: 'None', secure: true });
        res.send('Cookie set');
    });
}

main();
