require('dotenv').config()
// npm init to intialize an empty node.js project
const express = require('express')
// import express from 'express' // add type in package.json to use this line
const app = express() // created an express app
const port = process.env.PORT // specified the port number on which the app is running

app.get('/', (req, res) => { //.get is a one of the request methods. these methods always two parameters. one take the "/url" and the other is a callback function. callback always gives two parameters. one is request and the other is response.
// req to fetch the data and res to send the data/responce.
  res.send('Hello World!')
})

app.get('/about', (req, res) => { // multiple requests can be made on the same url.
    res.send('About Page')
})


app.listen(port, () => { //this is the .listen method. this method takes two parameters. one is the port number and the other is a callback function. this is method that listens to the requests on the specified port number.
  console.log(`Example app listening on port ${port}`) // this state tells that the app is listening on the specified port number.
})