import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from "path";
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User],
    dbName: 'lireddit',
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    user: 'nicksmith',
    password: '204237',
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
// as const will incresase specificity of things, before it ts though everything was type string
//alternative and better is the Parameters<typeof MikroOrm.init>[0];