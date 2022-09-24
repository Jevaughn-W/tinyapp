const express = require('express');
const { redirect, get } = require('express/lib/response');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

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

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// Rendering page associated with route "/URLS"
app.get("/urls", (req, res) => {
  const userUrls = urlsForUser(req.cookies.userId); 
  const templateVars = { urls: userUrls, user: users[req.cookies.userId] };
  res.render("urls_index.ejs", templateVars);
});

// Functions which carves out user's urls from database
const urlsForUser = (userId)=> {
  let userUrls = {};
  for(let url in urlDatabase) {
    if(urlDatabase[url].userId === userId) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.userId] };
  if(templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Rendering pages using request parameters
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longUrl: urlDatabase[req.params.id].longUrl, user: users[req.cookies.userId] };
  if(urlDatabase[req.params.id].userId === req.cookies.userId) {
    res.render("urls_show", templateVars);
  } else {
    res.sendStatus(403);
  }
});

// Shows the list of Urls
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = { longUrl: req.body.longUrl, userId: req.cookies.userId };
  if(req.cookies.userId) {
    res.redirect(`/urls/${id}`);
  } else {
    res.send("Please log in to generate a shortened url!")
  }
});

// Redirects from shortened Url to original Url
app.get("/urls/u/:id", (req, res) => {
  const id = req.params.id;
  const longUrl = urlDatabase[id].longUrl;
  if(longUrl) {
    res.redirect(longUrl);
  } else {
    res.send("Shortened url does not exist");
  }
});

// Delete functionality
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if(!urlDatabase[id]) { // Can refactor as a helper function
    res.sendStatus(403);
  } else {
    if(urlDatabase[id].userId === req.cookies.userId) {
    delete urlDatabase[id];
    res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Edit functionality
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  if(!urlDatabase[id]) {
    res.sendStatus(403);
  } else {
    if(urlDatabase[id].userId === req.cookies.userId) {
      urlDatabase[id].longUrl = req.body.longUrl;
      urlDatabase[id].userId = req.cookies.userId;
      res.redirect(`/urls/${id}`);
    } else {
      res.sendStatus(403);
    }
  }
});

// User login functionality
app.post("/login", (req, res) => {
  const loginEmail = req.body.userEmail;
  const loginPassword = req.body.userPassword;
  let duplicateEmail = true;

  userSearch(loginEmail,(user) => {
    if(loginPassword === users[user].password) {
      res.cookie('userId', user);
      duplicateEmail = false;
      res.redirect("/urls");
    } else {
      res.sendStatus(403);
    }
  });
  duplicateEmail === true? res.sendStatus(403): null; // Try implement callback with err and success
});

// User logout functionality
app.post("/logout", (req, res) => {
  res.clearCookie('userId', '/logout');
  res.redirect("/urls");
});

// User registraction
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.userId]}
  if(!req.cookies.userId){
    res.render('urls_registration', templateVars);
  } else{
    res.redirect("/urls");
  }
});

// User Registration handling
const users = {};

app.post("/register", (req, res) => {
  let userId = generateRandomString();
  res.cookie("userId", userId);

  if(!req.body.userEmail || !req.body.userPassword) {  // Check for null input in both username and password
    res.sendStatus(400);
  };
  
  userSearch(req.body.userEmail, ()=> { 
    res.sendStatus(400);
    delete users[userId]; // Doublechek is this line is needed
  }); 

  if(res.statusCode !== 400) {
    users[userId] = {
      id: userId,
      email: req.body.userEmail,
      password: req.body.userPassword
    }
  }
  res.redirect("/urls");
});

const userSearch = function(userEmail, callback) {
  for (let user in users) {  // Check if user email is already in database
    if (users[user].email === userEmail) {
      callback(user);
    } 
  }
};

// User log in handling
app.get("/login", (req, res) => {
  const templateVars = { user : users[req.cookies.userId] };
  if(!req.cookies.userId) {
    res.render("urls_login.ejs", templateVars);
  } else {
    res.redirect("/urls");
  }
});


function generateRandomString() {
  let id =[]
  let alphabet =['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u' ,'v', 'w', 'x', 'y', 'z'];
  for( let i = 0; i < 6 ; i++) {
    if(Math.random() > .5) {
      id.push(Math.floor(Math.random() *10));
    } else {
      Math.random > .5 ? id.push(alphabet[Math.floor(Math.random() * 10)].toUpperCase()): id.push(alphabet[Math.floor(Math.random() * 10)]);
    }
  }
  return id.join("");
};

