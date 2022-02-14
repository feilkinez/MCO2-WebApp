const express = require(`express`);
const app = express();

const controller = require(`../controllers/controller`);

app.get(`/`, controller.getIndex);
app.post(`/addEntry`, controller.addEntry);
app.get(`/delEntry/:id/:year`, controller.delEntry);
app.post(`/updateEntry`, controller.updateEntry);

module.exports = app;
