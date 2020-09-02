const { Router } = require('express');
const { register, login, googleSignIn } = require('../controllers/auth.controller');


const router = Router();

router.post('/register', register);

router.post('/login', login);

router.post('/google', googleSignIn);

module.exports = router;