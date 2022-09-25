// -------------------------------- REQUIREMENTS

const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

// ----------------------------------- Setup and Middleware

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['randomKey1', 'randomKey2'],
  maxAge: 10 * 60 * 1000
}));

// -------------------------------- Database Variables

const urlDatabase = {
  "b2xVn2": {
    longUrl: "http://www.lighthouselabs.ca",
    userId: "aJ48lW"
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    userId: "aJ48lW"
  }
};

const users = {};

// --------------------------------- Helper Functions

// Function which pulls user specific urls
const urlsForUser = (userId)=> {
  let userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === userId) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};

// Finds user by email and return user id
const { getUserByEmail } = require('./helpers');

// Generates user id
const generateRandomString = ()=> {
  let id = [];
  let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u' ,'v', 'w', 'x', 'y', 'z'];
  for (let i = 0; i < 6; i++) {
    if (Math.random() > .5) {
      id.push(Math.floor(Math.random() * 10));
    } else {
      Math.random() > .5 ? id.push(alphabet[Math.floor(Math.random() * 10)].toUpperCase()) : id.push(alphabet[Math.floor(Math.random() * 10)]);
    }
  }
  return id.join("");
};

// --------------------------------- Listener

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// --------------------------------- Routes / Endpoints

// Render home page
app.get("/urls", (req, res) => {
  const userUrls = urlsForUser(req.session.userId);
  const templateVars = { urls: userUrls, user: users[req.session.userId] };
  res.render("urls_index.ejs", templateVars);
});

// Render new url page
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Render page of shortened url
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longUrl: urlDatabase[req.params.id].longUrl, user: users[req.session.userId] };
  if (urlDatabase[req.params.id].userId === req.session.userId) {
    res.render("urls_show", templateVars);
  } else {
    res.sendStatus(403);
  }
});

// generate shortened url
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = { longUrl: req.body.longUrl, userId: req.session.userId };
  if (req.session.userId) {
    res.redirect(`/urls/${id}`);
  } else {
    res.send("Please log in to generate a shortened url!");
  }
});

// Redirects from shortened url to original url
app.get("/urls/u/:id", (req, res) => {
  const id = req.params.id;
  const longUrl = urlDatabase[id].longUrl;
  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res.send("Shortened url does not exist");
  }
});

// Delete url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) { // Can refactor as a helper function
    res.sendStatus(403);
  } else {
    if (urlDatabase[id].userId === req.session.userId) {
      delete urlDatabase[id];
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  }
});

// Edit url
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.sendStatus(403);
  } else {
    if (urlDatabase[id].userId === req.session.userId) {
      urlDatabase[id].longUrl = req.body.longUrl;
      urlDatabase[id].userId = req.session.userId;
      res.redirect(`/urls/${id}`);
    } else {
      res.sendStatus(403);
    }
  }
});

// logs in user
app.post("/login", (req, res) => {
  const loginEmail = req.body.userEmail;
  const loginPassword = req.body.userPassword;
  const user = getUserByEmail(loginEmail, users);
  
  if (user) {
    const userPassword = user.password;
    if (bcrypt.compareSync(loginPassword, userPassword)) {
      req.session.userId = user.id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid Credentials");
    }
  } else {
    res.status(403).send("Invalid Credentials");
  }
});

// logs out user
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// render registration page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.userId]};
  if (!req.session.userId) {
    res.render('urls_registration', templateVars);
  } else {
    res.redirect("/urls");
  }
});

// creates new user
app.post("/register", (req, res) => {
  
  if (!req.body.userEmail || !req.body.userPassword) {  // Check for null input in both username and password
    res.sendStatus(400);
  }
  
  const user = getUserByEmail(req.body.userEmail, users);

  if (!user) {
    let userId = generateRandomString();
    const password = req.body.userPassword;
    const hashedPassword = bcrypt.hashSync(password, 10);
    req.session.userId = userId;
    
    users[userId] = {
      id: userId,
      email: req.body.userEmail,
      password: hashedPassword
    };
    res.redirect("/urls");
  } else {
    res.status(403).send("User email already exists");
  }
});

// Render user log in page
app.get("/login", (req, res) => {
  const templateVars = { user : users[req.session.userId] };

  if (!req.session.userId) {
    res.render("urls_login.ejs", templateVars);
  } else {
    res.redirect("/urls");
  }
});