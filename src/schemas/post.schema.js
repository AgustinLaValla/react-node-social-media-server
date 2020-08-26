const { Schema, model } = require('mongoose');

const postSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
    comments: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now() }
        }
    ],
    likes: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            username: { type: String, required: true }
        }
    ],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = model('Post', postSchema);