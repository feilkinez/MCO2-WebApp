const express = require(`express`);
const app = express();

const controller = require(`../controllers/controller`);

app.get(`/`, controller.getIndex);
app.post(`/addEntry`, controller.addEntry);

module.exports = app;
