"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@mikro-orm/core");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const apollo_server_core_1 = require("apollo-server-core");
const express_1 = __importDefault(require("express"));
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    const redisClient = new ioredis_1.default();
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    const RedisStore = require("connect-redis").default;
    app.set("trust proxy", 1);
    app.use((0, cors_1.default)({
        credentials: true,
        origin: [
            "https://studio.apollographql.com",
            "http://localhost:3000",
            "http://localhost:4000"
        ],
    }));
    app.use((0, express_session_1.default)({
        name: 'cookieYumYum',
        store: new RedisStore({
            client: redisClient,
            disableTouch: true,
            disableTTL: true
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "lax",
            secure: false
        },
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
            validate: false
        }),
        context: ({ req, res }) => {
            return { em: orm.em, req, res };
        },
        plugins: [(0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`);
    app.get('/', (__, res) => {
        res.cookie('test_name', 'test_value', { httpOnly: true, sameSite: 'None', secure: true });
        res.send('Cookie set');
    });
};
main();
//# sourceMappingURL=index_old.js.map