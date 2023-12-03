import { Request, Response } from 'express';
import { EntityManager } from "@mikro-orm/core";
import session from 'express-session';
import { SessionData } from 'express-session';

export type MyContext = {
    em: EntityManager;
    req: Request & { session?: session.Session & Partial<SessionData> };
    res: Response;
};


// import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core"
// export type MyContext = {
//     em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
//     req: Request;
//     res: Response;
// }