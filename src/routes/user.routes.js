const { Router } = require('express');
const { getUsers ,getUser, addUserDetails, markNotificationAsRead, markAllNotificationsAsRead, searchUsers } = require('../controllers/user.controllers');
const { validateToken } = require('../middlewares/authorization');

const router = Router();

router.get('/', validateToken ,getUsers);

router.get('/:id', validateToken ,getUser);

router.get('/search/:search', searchUsers);

router.put('/add-user-details/:id', validateToken, addUserDetails);

router.put('/mark-notification-as-read/:notificationId', validateToken, markNotificationAsRead);

router.put('/mark-all-notifications-as-read', validateToken, markAllNotificationsAsRead);

module.exports = router;