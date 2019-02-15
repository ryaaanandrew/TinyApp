const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

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
  console.log('user_id:  ', user_id)
  return output;
}

app.get('/urls', (req, res) => {
   user = userDatabase[req.cookies['user_id']];

  if (user) {
      let templateVars = {userURLs: urlsForUser(user.id), username: user.id};
      res.render('urls_index', templateVars);
  } else {
      res.redirect('/login');
  }
});

app.get('/urls/new', (req, res) => {
  const user = userDatabase[req.cookies['user_id']];

  if (user) {
    let templateVars = { user: user, username: userDatabase[req.cookies['user_id']] };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/register');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL : req.params.shortURL ,
    longURL  : urlDatabase[req.params.shortURL],
    username : userDatabase[req.cookies['user_id']]
  };

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

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id'],
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  const user = urlDatabase[req.cookies['user_id']]

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
  let userEmail = checkEmail(email, password);

  if (!email || !password) {
    res.send('email or password was left blank');
  }

  if(userEmail) {
    res.send("email already on syster 404")
  } else {
    user_id = generateRandomString();
    userDatabase[user_id] = {
      id: user_id,
      email: email,
      password:password,
    }
    res.redirect("/login");
  };
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



























