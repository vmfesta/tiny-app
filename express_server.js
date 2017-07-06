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
};

var totalUsers = 2;

const users = {
  id1: {
    id: "id1",
    email: "test@test.com",
    password: "1"
  },
  id2: {
    id: "id2",
    email: "test2@test.com",
    password: "123456"
  }
};

app.post("/urls/:id/update", (req, res) => {
  let short = req.params.id
  urlDatabase[short] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  for (let id in users) {
    let user = users[id];
      if(user.email === req.body.email) {
        if(user.password === req.body.password) {
          res.cookie('user_id', user.id);
          res.redirect("/urls");
        }  
      }
  }
  res.statusCode = 403;
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  let user = searchUsername(req.cookies["user_id"]);
  console.log(user);
  let templateVars = { 
    urls: urlDatabase,
    user:user
  };
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
  res.clearCookie('user_id');
  res.redirect(`/urls/`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render(`register_form`);
});

app.post("/register", (req, res) => {
  if(!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.redirect("/register");   
  }
  if(!req.body.email) {
    res.statusCode = 400;
    res.redirect("/register");   
  }
  
  let email = req.body.email;
  let pass = req.body.password;
  let id = generateId();
  for (var ids in users) {
    if (users.hasOwnProperty(ids)) {
      var newUser = users[ids];
      if(newUser.email === email) {
        res.statusCode = 400;
        res.redirect("/register");
      }
    }
  }
  
  let user = {
    id: id,
    email: email,
    password: pass,
  }

  users[id] = (user);
  res.cookie('username', email);
  res.redirect(`/urls`);
});

function searchUsername(id) {
  console.log(id);
  for (var userId in users) {
    if (users.hasOwnProperty(userId)) {
      var user = users[userId];
      console.log(user);
      if(user.id === id) {
        return user;
      }
    }
  }
  return;
}

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function generateId() {
  return "id" + Number(totalUsers + 1);
}


app.listen(8080);
console.log('8080 is up');