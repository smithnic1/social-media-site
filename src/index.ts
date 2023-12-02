import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
    // Connect to db
    const orm = await MikroORM.init(mikroConfig);

    // Run migration
    await orm.getMigrator().up();

    // Create a fork of EntityManager for context-specific operations
    // const em = orm.em.fork();

    // Run SQL
    // const post = em.create(Post, { title: 'my first post' });
    // await em.persistAndFlush(post);

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: () => ({ em: orm.em })
    })

    await apolloServer.start();

    apolloServer.applyMiddleware({ app: app as any });

    app.listen(4000, () => {
        console.log('server started');
    })
}

main();
