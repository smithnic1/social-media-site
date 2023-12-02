import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";

@InputType()
class UsernamePasswordInput {
    @Field(() => String)
    username: string;

    @Field(() => String)
    password: string;
}

@Resolver()
export class UserResolver {
    @Mutation(() => User)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ) {
        const hashedPassword = await argon2.hash(options.password)
        const forkedEM = em.fork();
        const user = forkedEM.create(User, {
            username: options.username,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        await forkedEM.persistAndFlush(user);
        return user;
    }

    @Mutation(() => User)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ) {
        const forkedEM = em.fork();
        const user = await forkedEM.findOne(User, { username: options.username })
        if (!user) {
            return {
                errors: [{}]
            }

        }
        const hashedPassword = await argon2.hash(options.password)
        return user;
    }
}