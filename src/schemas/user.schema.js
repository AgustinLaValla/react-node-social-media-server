const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: { type: String, require: true, unique: false },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    picVersion: { type: String, default: '1591573111' },
    picId: { type: String, default: 'avatar_tmoqrv.png' },
    bio: { type: String, required: false },
    website: { type: String, required: false },
    location: { type: String, required: false },
    google: { type: Boolean, required:true, default:false },
    img: { type:String, required:false, default:null },
    posts: [
        { postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true } }
    ],
    notifications: {
        postNotifications: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
                username: { type:String, required:true },
                postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
                message: { type: String, required: true },
                createdAt: { type: Date, default: Date.now() },
                read: { type: Boolean, default: false },
                type: { type: String, enum: { values: ['like', 'comment'] } }
            }
        ]
    },
    chatList: [
        {
            receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            msgId: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
        }
    ]
}, { timestamps: true })

//Hide the password to the final user
userSchema.methods.toJSON = function() {
    const user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

module.exports = model('User', userSchema);