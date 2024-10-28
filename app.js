const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const client = redis.createClient({"url": "redis://red-csfobk08fa8c73a1gftg:6379"});
client.connect();

app.use(express.urlencoded({ extended: false }));

// Session setup
app.use(session({
    store: new RedisStore({ client }),
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Passport setup
passport.use(new LocalStrategy(
    function(username, password, done) {
        // Replace this with your own logic to verify username and password
        if (username === 'user' && password === 'pass') {
            return done(null, { id: 1, username: 'user' });
        } else {
            return done(null, false, { message: 'Incorrect credentials.' });
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    // Replace this with your own logic to fetch user by ID
    done(null, { id: 1, username: 'user' });
});

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
    if(req.user)
        res.send("Home Page<br>User is: " + req.user.id + " - " +req.user.username);
    else
        res.send('Home Page');
});

app.get('/login', (req, res) => {
    res.send('<form action="/login" method="post"><div><label>Username:</label><input type="text" name="username"/></div><div><label>Password:</label><input type="password" name="password"/></div><div><input type="submit" value="Log In"/></div></form>');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
