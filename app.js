const express = require('express');
const session = require('express-session');
const cors = require('cors');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

const corsOptions = {
    origin: [
        '*',
        'http://localhost:3000',
        'https://accounts.google.com',  // Keeping the Google origin
        'https://https://testr-lwj0.onrender.com',
        'https://*.onrender.com'
    ],
    credentials: true, // Allow credentials (cookies, Authorization headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept' ]
};

// Handle preflight requests
app.options('*', cors(corsOptions));
// Apply CORS middleware before your routes
app.use(cors(corsOptions));


const client = redis.createClient({"url": "redis://red-csfobk08fa8c73a1gftg:6379"});
//const client = redis.createClient();
client.connect();

app.use(express.urlencoded({ extended: false }));

// Session setup
app.use(session({
    store: new RedisStore({ client }),
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

const localOptions = {
    usernameField: 'email', // Assuming email is used as the username
    passwordField: 'password', // Field name for the password
    passReqToCallback: true // Don't pass request object to verify callback
};


// Passport setup
passport.use(new LocalStrategy( 
    function(username, password, done) {
        // Replace this with your own logic to verify username and password
        if (username === 'b@b.com' && password === 'b') {
            return done(null, { id: 1, username: 'b@b.com' });
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
    done(null, { id: 1, username: 'b@b.com' });
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
