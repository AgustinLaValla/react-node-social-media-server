const { Router } = require('express');
const { register, login, googleSignIn, renovateToken } = require('../controllers/auth.controller');
const { validateToken } = require('../middlewares/authorization');
const router = Router();

router.get('/renovate-token', validateToken, renovateToken);

router.post('/register', register);

router.post('/login', login);

router.post('/google', googleSignIn);

module.exports = router;