const dotenv = require(`dotenv`);
const path = require(`path`);
const express = require(`express`);

// Imports hbs
const hbs = require(`hbs`);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set(`view engine`, `hbs`);
app.use(express.static(path.join(__dirname, `public`)));
hbs.registerPartials(__dirname + `/views/partials`);

dotenv.config();
port = process.env.PORT;
hostname = process.env.HOSTNAME;

// Import routes from /routes/routes.js
const routes = require(`./routes/routes.js`);

app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 60 * 60 * 24 },
  })
);

app.use(`/`, routes);

// Load error if page doesn't exist
app.use(function (req, res) {
  var details = {};

  // render `../views/error.hbs`
  res.render("Error", details);
});

hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

app.listen(port, hostname, function () {
  console.log(`Server is running at:`);
  console.log(`http://` + hostname + `:` + port);
});
