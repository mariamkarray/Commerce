const express = require('express');

const authController = require('../controllers/auth');

const isAuth = require('../middleware/is-auth')

// the curly braces gets the check function only
const { check, body } = require('express-validator')

const router = express.Router();

const User = require('../models/user')

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/login', 
check('email', 'Email field is empty.').normalizeEmail().notEmpty(),
check('password', 'Password field is empty.').trim().notEmpty(),
authController.postLogin);

// add a middleware that gets executed before the controller, which is the check function
// check() returns an object, which ill apply a method on
router.post('/signup', check('email').normalizeEmail().isEmail().withMessage('Enter a valid email.') 
.custom(async (value, { req }) => {
    const userFound = await User.findOne({email: value})
      if (userFound) {
        return Promise.reject("Email address already exists!");
      }
}),
body('password', 'Please enter a password with only numbers and text and at least 3 characters.').trim().isLength({min: 3}).isAlphanumeric(),
// making a custom function
// i need access to the request object { req } because the password is sent through it
body('confirmPassword').trim().custom((value, { req }) => {
    if (value !== req.body.password)
        throw new Error('Passwords have to match!');
    return true;
}),
authController.postSignup);

router.post('/logout', authController.postLogout);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

module.exports = router;