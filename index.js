require('dotenv').config()

const express = require('express') // Importing the express module

const app = express() // Creating an instance of express

const port = 4000 // Defining the port number server will listen on 3000 port

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/twitter', (req, res) => {
    res.send('harshalsharmadotcom')
})

app.get('/login', (req, res) => {
    res.send('<h1>pleaase login at chai aur code</h1>')
})

app.get('/youtube', (req, res) => {
    res.send("<h2>You are in the world of youtube!</h2>")
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})