import { Request, Response } from "express";
import Post from '../model/post_model';
import User from '../model/user_model';


const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find();
        return res.status(200).send(posts);
    } catch {
        return res.status(400);
    }
}

const getPostsByOwner = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id);
        if (user === null) {
            return res.status(401).send("user not found");
        }
        return res.status(200).send(user.posts);
    } catch {
        return res.status(400);
    }
}

const createPost = async (req: Request, res: Response) => {
    const owner = req.body.owner;
    const description = req.body.description;
    const photo = req.body.photo;
    if (!description && !photo) {
        return res.status(400).send("description or photo is required");
    }
    try {
        const user = await User.findOne({ _id: owner });
        if (user === null) {
            return res.status(401).send("user not found");
        }
        // save post and update user posts
        const post = new Post(req.body);
        await post.save();
        user.posts.push(post);
        await user.save();
        return res.status(200).send(post);
    } catch {
        console.log("error");
        return res.status(500);
    }
}

const updatePost = async (req: Request, res: Response) => {
    const id = req.params.id;
    const description = req.body.description;
    const photo = req.body.photo;
    if (!description && !photo) {
        return res.status(400).send("description or photo is required");
    }
    try {
        const post = await Post.findOneAndUpdate(
            { _id: id },
            req.body,
            { new: true }
        );
        if (post === null) {
            return res.status(401).send("post not found");
        }
        return res.status(200).send(post);
    } catch {
        return res.status(500);
    }
}

const deletePost = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const deletePost = await Post.findByIdAndDelete(id);
        if (!deletePost) {
            return res.status(401).send("post not found");
        }
        const user = await User.findOne({ _id: deletePost['owner'] });
        if (user === null) {
            return res.status(401).send("user not found");
        }
        user.posts.pull(deletePost);
        await user.save();
        return res.status(200).send("post deleted");
    } catch {
        return res.status(500);
    }
}

export = {
    getAllPosts,
    getPostsByOwner,
    createPost,
    updatePost,
    deletePost
}