import "dotenv/config.js";

import express from 'express'
import { fileURLToPath } from "url";
import path from "path"
import registerTwitch from './controllers/twitch.js';

const app = express();
const port = process.env.PORT || 3000;

const baseRouter = express.Router();
app.use('/chatbox', baseRouter);

const apiRouter = express.Router();
baseRouter.use('/api', apiRouter);

registerTwitch(apiRouter);

const index = fileURLToPath(import.meta.resolve('@chatbox/client/build/index.html'));
const pubdir = path.dirname(index);

console.log(index, pubdir);

// serve static files
baseRouter.use(express.static(pubdir));

baseRouter.get(/(.*)/, (req, res) => {
    res.sendFile("index.html", { root: pubdir });
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});