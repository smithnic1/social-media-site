import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

export default {
    migrations: {
        path: "./migrations",
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post],
    dbName: 'lireddit',
    type: 'postgresql',
    user: 'admin',
    password: 'postgres',
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
// as const will incresase specificity of things, before it ts though everything was type string
//alternative and better is the Parameters<typeof MikroOrm.init>[0];