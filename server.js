const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

//Routes
const users = require('./routes/api/users');
const posts = require('./routes/api/posts');
const profile = require('./routes/api/profile');

const app = express();


    // Body-Parser Middleware
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    //DB Config
    const db = require('./config/keys').mongoURI;
    //Connection To MongoDB
    mongoose
        .connect(db,{useNewUrlParser:true})
        .then(()=>console.log(">MongoDB Successfullly Connected"))
        .catch(err=>console.log(err));

// Passport Middleware
app.use(passport.initialize());
// Passport Config
require('./config/passport')(passport);

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));
  
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Port
const port = process.env.PORT || 5000;

app.listen(port, () => console.log("This API is live at: "+`http://localhost:${port}`));