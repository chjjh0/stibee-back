const express = require("express");
const app = express();
const path = require("path");
const cors = require('cors');
const router = express.Router();



const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/key");

// const mongoose = require("mongoose");
// mongoose
//   .connect(config.mongoURI, { useNewUrlParser: true })
//   .then(() => console.log("DB connected"))
//   .catch(err => console.error(err));

const mongoose = require("mongoose");
const connect = mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Success'))
  .catch(err => console.log('MongoDB Error!!!', err));

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api/user', require('./routes/users'));
app.use('/api/post', require('./routes/post'));
app.use('/api/mail', require('./routes/mail'));

app.use('/', function(req, res) {
    // console.log('main req success', req);
    res.send('success')
})





// app.use('/api/video', require('./routes/video'));


// // Serve static assets if in production
// if (process.env.NODE_ENV === "production") {

//   // Set static folder
//   app.use(express.static("client/build"));

//   // index.html for all page routes
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
//   });
// }

const port = process.env.PORT || 5000

app.listen(port, () => {
  // console.log(`Server Running at ${port}`)
});