const Post = require('../schemas/post.schema');
const User = require('../schemas/user.schema');

const addPost = async (req, res) => {
    try {
        const post = await Post.create({ ...req.body, userId: req.user._id });

        await User.updateOne({ _id: req.user._id }, {
            $push: {
                posts: {
                    postId: post._id
                }
            }
        });

        return res.json({ ok: true, message: 'Post successfully created', post });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }
};


const getPosts = async (req, res) => {
    let { limit } = req.query;
    limit = parseInt(limit);

    try {
        const posts = await Post.find()
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('comments.userId', 'username picVersion picId img google')
            .populate('likes.userId', 'username picVersion picId img google')
            .populate('userId', 'username picVersion picId img google');

        const total = await Post.estimatedDocumentCount();

        return res.json({ ok: true, posts, total });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }
};

const getPost = async (req, res) => {
    const { postId } = req.params;
    try {
        const post = await Post.findById(postId).populate('comments.userId', 'username email picId picVersion img google')
            .populate('likes.userId', 'username picVersion picId img google')
            .populate('userId', 'username picVersion picId img google');
        if (!post) return res.status(404).json({ ok: false, message: 'Post Not Found' });
        return res.json({ ok: true, post });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }
};

const getUserPosts = async (req, res) => {
    const { userId } = req.params;

    try {
        const posts = await Post.find({ userId }).populate('comments.userId', 'username email picId picVersion google img')
            .populate('likes.userId', 'username picVersion picId google img')
            .populate('userId', 'username picVersion picId google img');
        return res.json({ ok: true, posts });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }

};

const addLike = async (req, res) => {
    const { postId, userId } = req.params;
    try {
        await Post.updateOne({ _id: postId }, {
            $push: {
                likes: {
                    userId: req.user._id,
                    username: req.user.username
                }
            },
            $inc: { likeCount: 1 }
        }).where('likes.userId').ne(req.user._id);

        const exists = await User.findOne().and([
            { 'notifications.postNotifications.postId': postId },
            { 'notifications.postNotifications.userId': req.user._id },
            { 'notifications.postNotifications.type': 'like' }
        ]);


        if (!exists) {
            await User.updateOne({ _id: userId }, {
                $push: {
                    'notifications.postNotifications': {
                        userId: req.user._id,
                        username: req.user.username,
                        postId: postId,
                        message: `${req.user.username} likes your post`,
                        type: 'like',
                        createdAt: new Date()
                    }
                }
            });

        }


        return res.json({ ok: true, message: 'Like successfully added' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }
};

const addComment = async (req, res) => {
    const { postId, userId } = req.params;
    const { comment } = req.body;
    try {
        await Post.updateOne({ _id: postId }, {
            $push: {
                comments: {
                    userId: req.user._id,
                    comment
                }
            },
            $inc: { commentCount: 1 }
        });

        await User.updateOne({ _id: userId }, {
            $push: {
                'notifications.postNotifications': {
                    userId: req.user._id,
                    username: req.user.username,
                    postId: postId,
                    message: `${req.user.username} has commented your post`,
                    type: 'comment',
                    createdAt: new Date()
                }
            }
        })

        return res.json({ ok: true, message: 'Comment Successfully added' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }
}

const unlike = async (req, res) => {
    const { postId, userId } = req.params;
    try {
        await Post.updateOne({ _id: postId }, {
            $pull: {
                likes: {
                    userId: req.user._id
                }
            },
            $inc: { likeCount: -1 }
        }).where('likes.userId').equals(req.user._id);

        await User.updateOne(
            { _id: userId },
            {
                $pull: {
                    'notifications.postNotifications': {
                        postId: postId,
                        userId: req.user._id,
                        type: 'like'
                    }
                },
            },
            { multi: true }
        );

        return res.json({ ok: true, message: 'Post successfuly unliked' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }
}

const removeComment = async (req, res) => {
    const { postId, commentId } = req.params;

    try {
        await Post.updateOne({ _id: postId }, {
            $pull: {
                comments: {
                    _id: commentId
                }
            },
            $inc: { commentCount: -1 }
        }).where('comments._id').equals(commentId);

        return res.json({ ok: true, message: 'Comment successfully removed' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, message: 'Internal Server Error' });
    }
}

const deletePost = async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findByIdAndDelete(postId).where('userId').equals(req.user._id);
        if (!post) return res.status(404).json({ ok: false, message: 'Post Not Found' });

        await User.updateOne({ _id: req.user._id }, {
            $pull: {
                posts: {
                    postId: postId
                }
            }
        });

        return res.json({ ok: true, message: 'Post successfully deleted' });

    } catch (error) {
        console.log(error);
        return res.json({ ok: false, message: 'Internal Server Error' });
    }

}

module.exports = { addPost, addLike, getPost, getPosts, getUserPosts, addComment, unlike, removeComment, deletePost };