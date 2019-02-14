const express = require('express'); //REQUIRE EXPRESS MIDDLEWARE
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser'); // REQUIRE BODY-PARSER
const cookieParser = require('cookie-parser') // REQUIRE COOKIE-PARSER

function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs'); // SETS VIEW ENGINE AS EJS

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function checkEmail(email, res) {
  for (let users in userDatabase) {
    if (email === userDatabase[users]['email']) {
      console.log('if function works')
      res.send('email already in database');
    }
  }
}

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies['user_id']};
  res.render('urls_index', templateVars);
});
// READS

app.get('/urls/new', (req, res) => {
  let templateVars = { username: req.cookies['user_id'] }
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL], username: req.cookies['user_id'] };
  res.render('urls_show', templateVars);
});


app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get('/register',  (req, res) => {
  let templateVars = { username: req.cookies['user_id'] }
  res.render('urls_register', templateVars)
});

app.post( '/urls', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL] };
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  urlDatabase[shortURL] = urlDatabase[shortURL];
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let newUser = {};

  if (!email || !password) {
    res.send('email or password was left blank');
  }

  checkEmail(email, res);

 user_id = generateRandomString();
   users[user_id] = {
      id: user_id,
      email: email,
      password:password,
   }

  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



























