const dotenv = require(`dotenv`);
const path = require(`path`);
const express = require(`express`);
const bodyParser = require(`body-parser`);

// Imports hbs
const hbs = require(`hbs`);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set(`view engine`, `hbs`);
app.use(express.static(path.join(__dirname, `public`)));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

hbs.registerPartials(__dirname + `/views/partials`);

dotenv.config();
port = process.env.PORT;
hostname = process.env.HOSTNAME;

// Import routes from /routes/routes.js
const routes = require(`./routes/routes.js`);

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
