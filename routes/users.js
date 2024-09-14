const router = require('express').Router();
const {getAllUsers, getSingleUser, register, login} = require('../controllers/users')



router.get('/' , getAllUsers);

router.get('/:id' , getSingleUser);

router.post('/register' , register);

router.post('/login' , login);













module.exports = router;