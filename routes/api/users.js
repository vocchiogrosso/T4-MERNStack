const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User Model
const User = require('../../models/User');

// @route   GET api/users/
// @desc    Tests users route
// @access  Public
router.get('/',(req,res)=>res.json({msg: "Users Works"}));

// @route   GET api/users/register
// @desc    Register Users
// @access  Public

//| This Method Works |//
router.post('/register', (req, res) =>{
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check Validation
  if(!isValid){
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email })
      .then(user => {
          if(user) {
            errors.email = "Email Already Exists";
              return res.status(400).json(errors);
          } else {
              const avatar = gravatar.url(req.body.email, {
                  s: '200',
                  r: 'pg',
                  d: 'mm'
              });

              const newUser = new User({
                  name: req.body.name,
                  email: req.body.email,
                  avatar: avatar,
                  password: req.body.password
              });

              bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(req.body.password, salt, (err, hash) => {
                      if(err) throw err;
                      newUser.password = hash;
                      newUser
                          .save()
                          .then(user => res.json(user))
                          .catch(err => console.log(err));
                  })
              });
          }
      });
});

/*| This Method Is A Backup
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }, (err, foundUser) => {
    if(err) return res.status(400).json({Error: err});
    if(foundUser) return res.status(400).json({ email: 'Email Already Exists'});
    const {name, email, password, avatarURL } = req.body;
    bcrypt.hash(password, 10, (err, hash)=> {
      User.create(
        { name, email, password: hash, avatarURL},
        (err, newUser) => {
          if(err) console.log(err);
          else res.json(newUser);
        }
      )
    })
  })
});
*/

// @route   GET api/users/login
// @desc    Login Users / Returning JWT
// @access  Public
router.post('/login', (req,res) =>{
  const { errors, isValid} = validateLoginInput(req.body);
  //Check Validation
  if(!isValid){
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  //Find Via Email
  User.findOne({email})
    .then(user => {
      //Check For User
      if(!user){
        errors.email = 'User Not Found';
        return res.status(404).json(errors);
      }
      //Check For Password
      bcrypt.compare(password, user.password).then(isMatch => {
        if(isMatch){
          //User Matched
          const payload = {id: user.id, name: user.name, avatar: user.avatar } // Creates JWT Payload
          //Sign Token
          jwt.sign(payload, keys.secretOrKey, {expiresIn:7200}, 
          (err, token) => {
            res.json({
              success:true,
              token:'Bearer '+token
            })
          });
        }else{
          errors.password = "Password Incorrect";
          res.status(400).json(errors);
        }
      });
    });
});

// @route   GET api/users/current
// @desc    Return Current User
// @access  Private
router.get(
  '/current',
  passport.authenticate('jwt',{session:false}), (req,res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  });
})



module.exports = router;