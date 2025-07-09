import express from "express";
import bodyParser from "body-parser";

import generateRoute from './routes/generate.js';

const app = express();
app.use(bodyParser.json());

app.use('/generate', generateRoute);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})