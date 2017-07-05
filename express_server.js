var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser())
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

var urlDatabase = {
  urls: {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  },
  username: ""
};

app.post("/urls/:id/update", (req, res) => {
  console.log(req.params);
  let short = req.params.id
  urlDatabase[short] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username:req.cookies['username']
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let url = req.body
  let short = generateRandomString();
  urlDatabase[short] = url.longURL;
  res.redirect(`http://localhost:8080/urls/${short}`);
});

app.post("/urls/:id/delete", (req, res) => {
  var short = req.params.id;
  delete urlDatabase[short];
  res.redirect("/urls");
});

app.post("/urls/redirect/:id", (req, res) => {
  var short = req.params.id;
  res.redirect(`/urls/${short}`);
});

app.post("/logout", (req, res) => {
  urlDatabase.username = "";
  res.clearCookie('username');
  res.redirect(`/urls/`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


app.listen(8080);
console.log('8080 is up');