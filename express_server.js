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
    password: "pass1"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "pass2"
  }
}


function retrieveUser(email, password) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email && userDatabase[user].password === password) {
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

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, username: userDatabase[req.cookies['user_id']]};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  // let templateVars = {  };
  const user = userDatabase[req.cookies['user_id']];
  console.log('user: ', user)
  if (user) {
    let templateVars = { user: user, username: userDatabase[req.cookies['user_id']] };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/register');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL], username: userDatabase[req.cookies['user_id']]};
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get('/register',  (req, res) => {
  let templateVars = { username: userDatabase[req.cookies['user_id']] };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = { username: userDatabase[req.cookies['user_id']]};
  res.render('urls_login', templateVars);
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
  let email = req.body.email;
  let password = req.body.password;
  let user = retrieveUser(email, password);

  if (user) {
    res.cookie('user_id', user.id);
    res.redirect('urls');
  } else {
    res.send('404 error!')
  }

});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let newUser = {};
  let userEmail = checkEmail(email, password);

  if (!email || !password) {
    res.send('email or password was left blank');
  }

  if(userEmail) {
    console.log('first if checked')
    res.send("email already on syster 404")
  } else {
    console.log('second if checked')
    user_id = generateRandomString();
    userDatabase[user_id] = {
      id: user_id,
      email: email,
      password:password,
    }
    console.log(userDatabase);
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



























