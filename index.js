require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const mongoose = require('mongoose');

mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(res => console.log('MongoDB Success'))
  .catch(err => console.log('MongoDB Error!!!'));

app.use(express.static(path.join(__dirname, 'build')));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  bodyParser.json({
    limit: '10mb',
  }),
);
app.use(cookieParser());

app.use('/api/user', require('./routes/user'));
app.use('/api/post', require('./routes/post'));
app.use('/api/mail', require('./routes/mail'));

app.use('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 6000;

app.listen(port, () => {
  console.log(`Server Running at ${port}`);
});
