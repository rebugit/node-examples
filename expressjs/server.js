const {Sequelize} = require('sequelize')
// This package must be imported even if there are no methods to require
const {RebugitSDK} = require('rbi-nodejs-agent');
const axios = require('axios')
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const port = 9000

function myCustomIntegrationCallback(env, close, getData, wrap) {
    wrap(module, 'name', function (original) {
        // integration logic
        if (env === 'debug') {
            // inject logic
        }

        // extract logic
    })

    return {
        module: {},
        name: 'cors'
    }
}

const Rebugit = new RebugitSDK({
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiIzMTI3ODc1MC05NDUyLTQ4OGYtODNjNy1mYTYxZDcxZDcxZTQiLCJ0ZW5hbnRJZCI6IjFjNjJiZDc0LTQwMTYtNDBkZS1hNGJhLTZmMGZkYWU1ZjBmNyJ9.IYLawG70gdl5D3_OHZVV65KG0OEMh-CnqFBKbzEKoqo',
    collector: {
        collectorBaseUrl: "dev.api.rebugit.com"
    }
})

const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/postgres') // Example for postgres
const getDataFromDatabase = async () => {
    const res = await sequelize.query('SELECT 1 + 5 * :multi AS result', {
        replacements: {
            'multi': 4
        }
    })
    return res[0][0].result
}

const callExternalAPI = async () => {
    const resp = await axios.get('http://jsonplaceholder.typicode.com/todos/1')
    return resp.data
}

const doStuff = async (req, res, next) => {
    const {num} = req.body
    console.log("Received number: ", num)

    const data = await callExternalAPI();
    console.log("external call: ", data)

    const moreData = await getDataFromDatabase()
    console.log('From db', moreData)

    console.log("Title: ", data.title)

    const length = data.title.length;
    console.log("Title length: ", length)

    if (process.env.CUSTOM_ENV === 'allowError') {
        if (length - num === 0) {
            return next(new Error("Error: division by 0!!"))
        }
    }

    const magicNumber = 18 / (length - num)

    res.status(200).send({
        magicNumber
    })
}

app.use(cors())
app.use(bodyParser.json())
app.use(Rebugit.Handlers().requestHandler({}))
app.post('/', doStuff)
app.post('/send', doStuff)

app.use(Rebugit.Handlers().errorHandler({}))

app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    console.log(err.message, err.stack)
    res.statusCode = 500;
    res.send(err.message)
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
