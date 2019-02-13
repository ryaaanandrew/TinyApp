var express = require('express');
var app = express();
var PORT = 8080;
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

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies['user_id']};
  res.render('urls_index', templateVars);
});

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

app.post( '/urls', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL , longURL: urlDatabase[req.params.shortURL] };
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  urlDatabase[shortURL] = urlDatabase[shortURL];
  // res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.username); // Set-Cookie header
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); // setting PORT number





























