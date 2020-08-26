const { Router } = require('express');
const { changeProfileImage } = require('../controllers/images.controller');
const { validateToken } = require('../middlewares/authorization');

const router = Router();

router.put('/change-profile-image', validateToken ,changeProfileImage);

module.exports = router;