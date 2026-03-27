const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health');
const { router: usersRoutes } = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/users', usersRoutes);


module.exports = app;