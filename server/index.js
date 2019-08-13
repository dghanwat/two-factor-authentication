const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const login = require('./routes/login');
const register = require('./routes/register');
const auth = require('./routes/auth');

app.use(bodyParser.json());
app.use(cors());

app.use(login);
app.use(register);
app.use(auth);

app.listen('3000', () => {
    console.log('The server started running on http://localhost:3000');
});