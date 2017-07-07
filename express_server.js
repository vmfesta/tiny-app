var express = require("express");
const bcrypt = require('bcrypt');
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser');
var cookieSession  = require('cookie-session');
var Cookies = require( "cookies" );
var app = express();
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["userId"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

var urlDatabase = {
  urls: {
    "b2xVn2": {
      long: "http://www.lighthouselabs.ca",
      users: ["id1"]
    },
    "9sm5xK": {
      long: "http://www.google.com",
      users: []
    }
  }
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

// "/" blank path redirects to urls list if logged or login if not
app.get("/", (req, res) => {
  const id = req.session['user_id'];
  let user = searchUser(id)
  if(user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/redirect/:id", (req, res) => {
   var short = req.params.id;
   res.redirect(`/urls/${short}`);
});

//POST action that receives a short ID and update the long URL
app.put("/urls/:id/update", (req, res) => {
  debugger;
  let short = req.params.id
  let users = urlDatabase.urls.users;
  urlDatabase.urls[short].long = {longURL: req.body.longURL};
  res.redirect("/urls");
});

//render login page
app.get("/login", (req, res) => {
  res.render("login");
});

//POST action to login de user
app.post("/login", (req, res) => {
  var auth = validateLogin(req.body.email, req.body.password);
  if(auth.valid) {
    req.session["user_id"] = auth.id;
    res.redirect("/urls");
  }
  res.statusCode = 403;
  res.redirect("/login");
});

//render de urls list if logged if not goes to register page
app.get("/urls", (req, res) => {
  const id = req.session["user_id"];
  if(id) {
    let user = searchUser(id);
    let urls = urlsForUser(user.id);
    let templateVars = { 
      urls,
      user:user
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/register");
  }
});

//render page to create a new url if looged if not redirects to login
app.get("/urls/new", (req, res) => {
  if(req.session['user_id']) {
    const id = req.session['user_id'];
    let user = searchUser(id)
    templateVars = { user: user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login"); 
  }
});

//receives the short url and show the url page to the user be able to edit it
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let url = req.body
  let short = generateRandomString();
  let id = req.session['user_id'];
  let link = {
    short: short,
    long: url,
    users: [id]
  }
  urlDatabase.urls[short] = link;

  res.redirect(`http://localhost:8080/urls/${short}`);
});

//POST action to delete the URL if the user clicks on delete
app.delete("/urls/:id/delete", (req, res) => {
  console.log(req.params);
  var short = req.params.id;
  delete urlDatabase.urls[short];
  res.redirect("/urls");
});

//POST action to logout user and destroy de cookie session
app.post("/logout", (req, res) => {
  urlDatabase.username = "";
  req.session = null;
  res.redirect(`/login`);
});

//redirects the user to the full url page
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase.urls[req.params.shortURL].long;
  res.redirect(longURL);
});

//goes to the register page
app.get("/register", (req, res) => {
  res.render(`register_form`);
});


//POST action that read the inputs and register the user
app.post("/register", (req, res) => {
  if(!req.body.username || !req.body.password) {
    res.statusCode = 400;
    res.redirect("/register");   
  } else {
    let email = req.body.username;
    const pass = bcrypt.hashSync(req.body.password, 10);
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
    users[id] = user;
    req.session.user_id =  user.id;
    res.redirect(`/urls`);
  }
});

function searchUser(id) {
  for (var userId in users) {
    if (users.hasOwnProperty(userId)) {
      var user = users[userId];
      if(user.id === id) {
        return user;
      }
    }
  }
  return;
}

function validateLogin(username, pass) {
  for (let id in users) {
      let user = users[id];
        if(user.email === username) {
          if(bcrypt.compareSync(pass, user.password)) {
            return auth = {
              id: user.id,
              valid: true
            }
          }  
        }
    }
    return false;
}


function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function urlsForUser(id) {
  let arr = [];
  for (var urls in urlDatabase.urls) {
    if (urlDatabase.urls.hasOwnProperty(urls)) {
      let url = urlDatabase.urls[urls];
      if(url.users.indexOf(id) > -1) {
        let longUrl = url.long.longURL;
        let link = {
          short: urls,
          long: longUrl
        }
        arr.push(link);
      }
    }
  }
  return arr;
}

function generateId() {
  return "id" + Number(totalUsers + 1);
}


app.listen(8080);
console.log('8080 is up');