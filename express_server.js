const express = require('express');
const { redirect } = require('express/lib/response');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Rendering page associated with route "/URLS"
app.get("/urls", (req, res) => { 
  const templateVars = { urls: urlDatabase };
  res.render("urls_index.ejs", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Rendering pages using request parameters
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Shows the list of Urls
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// Redirects from shortened Url to original Url
app.get("/urls/u/:id", (req, res) => {
  const id = req.params.id;
  const longUrl = urlDatabase[id];
  res.redirect(longUrl);
});

// Delete functionality
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Edit functionality
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// User log in functionality
app.post("/login", (req, res) => {
  res.cookie("user", req.body);
  res.redirect("/urls");
})

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