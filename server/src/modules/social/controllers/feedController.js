import * as feedService from '../services/feedService.js';

export const createPost = async (req, res, next) => {
  try {
    const { content, type } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: { message: 'Content is required for a post.' } });
    }

    const post = await feedService.createPost(req.user.userId, req.user.role, content, type);
    return res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await feedService.fetchPosts();
    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const post = await feedService.toggleLikePost(req.params.id, req.user.userId);
    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const reportPost = async (req, res, next) => {
  try {
    const post = await feedService.reportPost(req.params.id);
    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const post = await feedService.addCommentToPost(req.params.id, req.user.userId, req.body.text);
    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};
