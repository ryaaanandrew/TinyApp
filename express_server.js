const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ['super-secret-key'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "i3BoGr": { longURL: "https://www.google.ca", userID: "aJ48lW" },
  "asdasd": { longURL: "https://www.facebook.ca", userID: "userRandomID" },
  "sdfsdf": { longURL: "https://www.youtube.ca", userID: "userRandomID" },
};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "pass1"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "pass2"
  }
}

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function retrieveUser(email, password) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email && bcrypt.compareSync(password, userDatabase[user].password)) {
      return userDatabase[user];
    }
  }
}

function checkEmail(email, password) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }
}

function urlsForUser(user_id) {
  const output = [];
  for (let shortURL in urlDatabase) {
    if (user_id === urlDatabase[shortURL].userID) {
      let urlOutput = {
        short: shortURL,
        long: urlDatabase[shortURL].longURL
      }
      output.push(urlOutput);
      // output.push({ short: shortURL, long: urlDatabase[shortURL].longURL });
    }
  }
  return output;
}

//if user is logged in, will show list of short URLs they have created
app.get('/urls', (req, res) => {
  let user = userDatabase[req.session['user_id']];
  if (user) {
      let templateVars = {userURLs: urlsForUser(user.id), username: userDatabase[req.session['user_id']]};
      res.render('urls_index', templateVars);
  } else {
      res.redirect('/login');
    }
});

//allows users to create new URLs
app.get('/urls/new', (req, res) => {
  const user = userDatabase[req.session['user_id']];

  if (user) {
    let templateVars = { user: user, username: userDatabase[req.session['user_id']] };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/register');
  }
});

//if user is logged in, page displaying short URL info
app.get('/urls/:shortURL', (req, res) => {
  const user = userDatabase[req.session['user_id']];
  let templateVars = {
    shortURL : req.params.shortURL ,
    longURL  : urlDatabase[req.params.shortURL].longURL,
    username : userDatabase[req.session['user_id']]
  };

  if (user) {
    res.render('urls_show', templateVars);
  } else {
    res.redirect('/login');
  }
});

//redirect to longURL 
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`http://${longURL}`);
});

//displays register page if user is not already logged in
app.get('/register',  (req, res) => {
  let templateVars = { username: userDatabase[req.session['user_id']] };
  const user = userDatabase[req.session['user_id']];
  if (user) {
    res.redirect('/urls');
  } else {
    res.render('urls_register', templateVars);
  }
});

// checks if user is logged in, if not redirects to /urls page
app.get('/login', (req, res) => {
  let templateVars = { username: userDatabase[req.session['user_id']]};
  const user = userDatabase[req.session['user_id']];
  if (user) {
    res.redirect('/urls');
  } else {
    res.render('urls_login', templateVars);
  }
});

//creates short URLs with dynamic characters then redirects users to new urls page 
app.post( '/urls', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL] };
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session['user_id'],
  };
  res.redirect(`/urls/${shortURL}`);
});

//update URLS from urls_show.ejs --> unable to edit URLSs
app.post('/urls/:shortURL', (req, res) => {
  let longURL = req.body.updateURL;
  let shortURL = req.params.shortURL;

  urlDatabase[shortURL].longURL = longURL;

  res.redirect('/urls');
});

//if the user is logged in, will allow them to delete URLs they have created
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  const user = userDatabase[req.session['user_id']];

  if (user) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send('cannot delete');
  }
});

//uses function retrieveUser to check if user is in the database, else redirects them to the register page
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = retrieveUser(email, password);

  if (user) {
    req.session['user_id'] = user.id;
    res.redirect('urls');
  } else {
    res.redirect('/register');
  }

});

//logs out user and clears cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//registers users and encrypts passwords, if already regisetered or fields left blank, will return an error
app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = checkEmail(email, password);

  if (!email || !password) {
    res.status(400).send('email or password was left blank.');
  } else if(user) {
    res.status(400).send('email already registered on system.');
  } else {
    user_id = generateRandomString();
    userDatabase[user_id] = {
      id: user_id,
      email: email,
      password: bcrypt.hashSync(password, 10)
    }
    req.session['user_id'] = userDatabase[user_id].id;
    res.redirect("/urls");
  };
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});












