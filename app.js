const express = require('express');
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const compression = require('compression')
const mongoose = require('mongoose');


const bookRouter = require('./routes/bookRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// CONNECT DATABASE
mongoose
  .connect('mongodb://127.0.0.1:27017/library', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('DB connection successful'));

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({
  secret: "thisisjavadalialibrarysecret",
  saveUninitialized: true,
  cookie: {maxAge: 1000 * 60 * 60 * 24},
  resave: false
}));

app.use(compression());
app.use(express.static("public"));
app.use('/',express.json());
app.use(express.urlencoded({extended:false}));
app.use(userRouter);
app.use('/books/', bookRouter);

//Log in page
app.get('/index',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'));
});

//Sign up page
app.get('/signup',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','signup.html'));
});


const port = 2000;
// process.env.PORT ||
const server = app.listen(port);
console.log('Listening on port '+port);

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION!! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });