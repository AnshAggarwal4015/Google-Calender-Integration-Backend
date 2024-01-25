const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(morgan('dev'));

app.use(
  cors()
);

app.use((req, res, next) => {
  // set the CORS policy
  res.header('Access-Control-Allow-Origin', '*');

  // set the CORS headers
  res.header(
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
  );

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
    return res.status(200).json({});
  }
  next();
});

app.use('/', require('./routes/googleCalendar'));

app.listen(port);

console.log(`Server listening on port ${port}`);