const User = require('../models/user');
const crypto = require('crypto')
const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

const { validationResult } = require('express-validator')

exports.getLogin = (req, res, next) => {
  const errors = validationResult(req)
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('error'),
    oldInput: {
      email: '', 
      password: ''
    },
    validationErrors: errors.array()
  });
};

exports.getSignup = (req, res, next) => {
  const errors = validationResult(req)
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: req.flash('error'),
    oldInput: {
      email: '', 
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email, 
        password
      },
      validationErrors: errors.array()
    })
  }
  User.findOne({email: email})
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: "Invalid email or password!",
          oldInput: {
            email, 
            password
          },
          validationErrors: errors.array()
        })
      }
      bcrypt.compare(password, user.password)
      .then(doMatch => {
        if (doMatch){
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);
            return res.redirect('/');
          });
        }
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: "Invalid email or password!",
          oldInput: {
            email, 
            password
          },
          validationErrors: []
        })
      })
    .catch(err => {
      console.log(err)
      res.redirect('/login')
       })
    })
    .catch(err => {
      const error = new Error(err);
        error.httpsStatuCode = 500;
        // passed to a special 4 arg middleware that handles errors
        return next(error);
  })
} 

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req)
  console.log(errors)
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {email, 
        password,
        confirmPassword},
        validationErrors: errors.array()
    },
    );
}
     bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: []}
      })
    return user.save()
    }).then(result => {
      res.redirect('/login')
      })
  .catch(err => {
    const error = new Error(err);
        error.httpsStatuCode = 500;
        // passed to a special 4 arg middleware that handles errors
        return next(error);
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: req.flash('error')
  });
}

exports.postReset = (req, res, next) => {
  // after the 32 bits are generated, an error and a buffer could be returned
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset')
    }
    // case buffer
    const token = buffer.toString('hex')
    User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        req.flash('error', 'No account with this email was found.');
        return res.redirect('/reset');
      }
      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
    .then(result => {
      res.redirect('/')
      const mailOptions = {
        from: 'mariamkarrayy@gmail.com',
        to: req.body.email,
        subject: "Password reset", 
        html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> link to set a new password.</p>
        `
      }
      const sent = transport.sendMail(mailOptions)
    })
    .catch(err => {
      const error = new Error(err);
        error.httpsStatuCode = 500;
        // passed to a special 4 arg middleware that handles errors
        return next(error);
    });
  });
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
  .then(user => {
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: req.flash('error'),
      userId: user._id.toString(),
      passwordToken: token
    });
  })
  .catch(err => {
    const error = new Error(err);
        error.httpsStatuCode = 500;
        // passed to a special 4 arg middleware that handles errors
        return next(error);
  });
}
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;


  User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}}, _id = userId)
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassowrd => {
    resetUser.password = hashedPassowrd;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save()
  })
  .then(result => {
    res.redirect('/login')
  })
  .catch(err => {
    const error = new Error(err);
        error.httpsStatuCode = 500;
        // passed to a special 4 arg middleware that handles errors
        return next(error);
  });
}