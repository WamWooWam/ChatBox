import "dotenv/config.js";

import express from 'express'
import registerTwitch from './controllers/twitch.js';

const app = express();
const port = process.env.PORT || 3000;

const baseRouter = express.Router();
app.use('/chatbox', baseRouter);

const apiRouter = express.Router();
baseRouter.use('/api', apiRouter);

registerTwitch(apiRouter);

// serve static files
baseRouter.use(express.static('public'));

// SPA, serve index.html for all routes
baseRouter.get(/(.*)/, (req, res) => {
    res.sendFile('public/index.html', { root: '.' });
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});