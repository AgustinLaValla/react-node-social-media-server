const { Router } = require('express');
const { validateToken } = require('../middlewares/authorization');
const { addPost, getPost, addLike, addComment, unlike, removeComment, deletePost, getPosts } = require('../controllers/posts.controllers');

const router = Router();

router.get('/', getPosts);

router.get('/:postId', validateToken, getPost);

router.post('/add-post', validateToken, addPost);

router.put('/add-like/:postId/:userId', validateToken, addLike);

router.put('/add-comment/:postId/:userId', validateToken, addComment);

router.put('/unlike/:postId/:userId', validateToken, unlike);

router.put('/remove-comment/:postId/:commentId', validateToken, removeComment);

router.delete('/delete-post/:postId', validateToken, deletePost);

module.exports = router;