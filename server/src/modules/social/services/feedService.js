import Post from '../models/Post.js';
import User from '../../identity/models/User.js';

export const createPost = async (userId, userRole, content, type = 'achievement') => {
  const newPost = await Post.create({
    authorId: userId,
    authorRole: userRole,
    content,
    type
  });

  return await newPost.populate({ path: 'authorId', select: 'email role' });
};

export const fetchPosts = async () => {
  // Fetch posts ordered by newest first
  return await Post.find({})
    .populate({ path: 'authorId', select: 'email role' })
    .populate({ path: 'commentsList.userId', select: 'email role' })
    .sort({ createdAt: -1 })
    .limit(50);
};

export const toggleLikePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  const hasLiked = post.likedBy.includes(userId);
  if (hasLiked) {
    post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString());
  } else {
    post.likedBy.push(userId);
  }
  await post.save();
  return post;
};

export const reportPost = async (postId) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  post.reports += 1;
  await post.save();
  return post;
};

export const addCommentToPost = async (postId, userId, text) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");
  
  post.commentsList.push({ userId, text });
  post.comments += 1;
  await post.save();
  return await post.populate({ path: 'commentsList.userId', select: 'email role' });
};
