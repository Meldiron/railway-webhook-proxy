const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { healthz } = require('express-healthz');

const app = express();

app.use(healthz);

app.use('/v1/execute', bodyParser.json(), async (req, res) => {
    try {
        const data = {
            body: req.body,
            headers: req.headers,
            protocol: req.protocol,
            host: req.hostname,
            pathname: req.originalUrl,
            method: req.method
        };

        const url = `${process.env.APPWRITE_ENDPOINT}/functions/${process.env.APPWRITE_FUNCTION_ID}/executions`;

        const body = {
            async: false,
            data: JSON.stringify(data)
        };

        const headers = {
            'Content-Type': 'application/json',
            'x-appwrite-key': process.env.APPWRITE_API_KEY,
            'x-appwrite-project': process.env.APPWRITE_PROJECT_ID
        };

        const response = await axios.post(
            url,
            body,
            {
                headers
            }
        );

        res.status(response.data.statusCode);
        res.json({
            data: response.data,
            code: response.data.statusCode,
        });
    } catch(err) {
        // Axios error
        if (err.response) {
            res.status(err.response.status);
            res.json({
                data: err.response.data,
                code: err.response.status,
            });
            return;
        }

        // Generic error
        res.status(500);
        res.json({
            data: "Unexpected server error: " + (err.message ? err.message : err),
            code: 500,
        });
    }
});

app.use(express.static('site'));

app.listen(process.env.PORT);