import express from "express";
import session from 'express-session';
import bodyParser from 'body-parser';
import path from "path";

import moneyRouter from './routes/index.js';

const app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use('/money', moneyRouter);

app.get('/', (req, res) => {
  res.redirect('/money/main');
});

app.use(express.static('public'));
app.use('/images',express.static('c:/money_upload_file'));

export default app;