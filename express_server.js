var express = require("express");
const bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser())
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

app.get("/", (req, res) => {
  const id = req.cookies['user_id'];
  let user = searchUsername(id)
  if(user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:id/update", (req, res) => {
  let short = req.params.id
  let users = urlDatabase.urls.users;
  urlDatabase.urls[short].long = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  var auth = validateLogin(req.body.email, req.body.password);
  if(auth.valid) {
    res.cookie('user_id', auth.id);
    res.redirect("/urls");
  }
  res.statusCode = 403;
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  if(id) {
    let user = searchUsername(id);
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

app.get("/urls/new", (req, res) => {
  // console.log(req.cookies['user_id']);
  // debugger;
  if(req.cookies['user_id']) {
    const id = req.cookies['user_id'];
    let user = searchUsername(id)
    templateVars = { user: user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login"); 
  }
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  debugger;
  let url = req.body
  let short = generateRandomString();
  let id = req.cookies['user_id'];
  let link = {
    short: short,
    long: url,
    user: [id]
  }
  urlDatabase.urls[short] = link;

  res.redirect(`http://localhost:8080/urls/${short}`);
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params);
  var short = req.params.id;
  delete urlDatabase.urls[short];
  res.redirect("/urls");
});

app.post("/urls/redirect/:id", (req, res) => {
  var short = req.params.id;
  res.redirect(`/urls/${short}`);
});

app.post("/logout", (req, res) => {
  urlDatabase.username = "";
  res.clearCookie('user_id');
  res.redirect(`/login`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase.urls[req.params.shortURL].long;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render(`register_form`);
});

app.post("/register", (req, res) => {
  if(!req.body.username || !req.body.password) {
    res.statusCode = 400;
    res.redirect("/register");   
  } else {
    let email = req.body.username;
    const pass = bcrypt.hashSync(req.body.password, 10);
    console.log(pass);
    let id = generateId();
    for (var ids in users) {
      if (users.hasOwnProperty(ids)) {
        var newUser = users[ids];
        if(newUser.email === email) {
          res.statusCode = 400;
          res.redirect("/register");
        } else {
          let user = {
            id: id,
            email: email,
            password: pass,
          }
          users[id] = user;
          console.log(users);
          res.cookie('user_id', user.id);
          res.redirect(`/urls`);
        }
      }
    }
  }
});

function searchUsername(id) {
  //console.log(id);
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
  debugger;
  let arr = [];
  console.log(id);
  for (var urls in urlDatabase.urls) {
    if (urlDatabase.urls.hasOwnProperty(urls)) {
      let url = urlDatabase.urls[urls];
      console.log(url);
      if(url.users.indexOf(id) > -1) {
        console.log(urls);
        console.log(url.long);
        let link = {
          short: urls,
          long: url.long
        }
        arr.push(link);
        console.log(link);
      }
      // url.users.forEach(function(rId) {
      //   if(rId === id) arr.push(id);        
      // });
    }
  }
  return arr;
}

function generateId() {
  return "id" + Number(totalUsers + 1);
}


app.listen(8080);
console.log('8080 is up');