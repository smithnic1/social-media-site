import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(@Ctx() { em }: MyContext): Promise<Post[]> {
        return em.find(Post, {});
    }

    @Query(() => Post, { nullable: true })
    async post(
        @Arg('id', () => Int) id: number,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        const forkedEM = em.fork();
        return forkedEM.findOne(Post, { id });
    }
    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post> {
        const forkedEM = em.fork();
        const post = forkedEM.create(Post, { title });
        await forkedEM.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title') title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post | null> {
        const forkedEM = em.fork();
        // const post = forkedEM.create(Post, { title });
        const post = await forkedEM.findOne(Post, { id });
        if (!post) {
            return null;
        }
        if (typeof title !== 'undefined') {
            post.title = title;
            await forkedEM.persistAndFlush(post);
        }
        await forkedEM.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,
        @Ctx() { em }: MyContext
    ): Promise<boolean> {
        const forkedEM = em.fork();
        await forkedEM.nativeDelete(Post, { id })
        return true;
    }
}