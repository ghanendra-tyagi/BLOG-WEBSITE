const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/blogDB');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/blogDB' })
}));

app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId;
    next();
});

app.use('/', authRoutes);
app.use('/blogs', blogRoutes);

app.get('/', (req, res) => res.redirect('/blogs'));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));