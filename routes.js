const express = require('express');
const router = express.Router();
const userCtrl = require('./controllers/userCtrl');

router.post('/user', userCtrl.addUser);

router.post('/group', userCtrl.addGroup);

router.post('/follow', userCtrl.follow);

router.post('/unfollow', userCtrl.unfollow);

router.get('/users', userCtrl.getUsers);

router.get('/user/:id', userCtrl.getUser);

router.get('/groups', userCtrl.getGroups);

module.exports = router;