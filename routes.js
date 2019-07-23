const express = require('express');
const router = express.Router();
const userCtrl = require('./controllers/userCtrl');

router.post('/user', userCtrl.addUser);

router.post('/group', userCtrl.addGroup);

router.put('/follow', userCtrl.follow);

router.put('/unfollow', userCtrl.unfollow);

router.get('/users', userCtrl.getUsers);

router.get('/user/:id', userCtrl.getUser);

module.exports = router;