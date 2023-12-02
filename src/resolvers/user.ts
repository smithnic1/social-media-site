import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";

@InputType()
class UsernamePasswordInput {
    @Field(() => String)
    username: string;

    @Field(() => String)
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: Error[]
}

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {

        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username must be greater than 2 characters'
                }]
            }
        }
        if (options.password.length <= 3) {
            return {
                errors: [{
                    field: 'password',
                    message: 'password must be greater than 3 characters'
                }]
            }
        }

        const hashedPassword = await argon2.hash(options.password)
        const forkedEM = em.fork();
        const user = forkedEM.create(User, {
            username: options.username,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        try {
            await forkedEM.persistAndFlush(user);
        } catch (err) {
            console.log(err.code)
            if (err.code === '23505') {
                return {
                    errors: [{
                        field: "username",
                        message: "username already exists"
                    }]
                }
            }
        }
        return user;
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {
        const forkedEM = em.fork();
        const user = await forkedEM.findOne(User, { username: options.username })
        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: 'user does not exist',
                },
                ],
            }

        };
        const valid = await argon2.verify(user.password, options.password)
        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: 'incorrect password',
                },
                ],
            }
        }
        return {
            user
        };
    }
}