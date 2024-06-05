require('dotenv').config()
// npm init to intialize an empty node.js project
const express = require('express')
// import express from 'express' // add type in package.json to use this line
const app = express() // created an express app
const port = process.env.PORT // specified the port number on which the app is running

const githubdata = {
  "login": "hiteshchoudhary",
  "id": 11613311,
  "node_id": "MDQ6VXNlcjExNjEzMzEx",
  "avatar_url": "https://avatars.githubusercontent.com/u/11613311?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/hiteshchoudhary",
  "html_url": "https://github.com/hiteshchoudhary",
  "followers_url": "https://api.github.com/users/hiteshchoudhary/followers",
  "following_url": "https://api.github.com/users/hiteshchoudhary/following{/other_user}",
  "gists_url": "https://api.github.com/users/hiteshchoudhary/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/hiteshchoudhary/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/hiteshchoudhary/subscriptions",
  "organizations_url": "https://api.github.com/users/hiteshchoudhary/orgs",
  "repos_url": "https://api.github.com/users/hiteshchoudhary/repos",
  "events_url": "https://api.github.com/users/hiteshchoudhary/events{/privacy}",
  "received_events_url": "https://api.github.com/users/hiteshchoudhary/received_events",
  "type": "User",
  "site_admin": false,
  "name": "Hitesh Choudhary",
  "company": null,
  "blog": "https://www.youtube.com/c/HiteshChoudharydotcom",
  "location": "India",
  "email": null,
  "hireable": null,
  "bio": "I make coding videos on youtube and for courses. My youtube channel explains my work more. Check that out",
  "twitter_username": "hiteshdotcom",
  "public_repos": 87,
  "public_gists": 4,
  "followers": 23073,
  "following": 0,
  "created_at": "2015-03-23T13:03:25Z",
  "updated_at": "2024-05-27T08:52:49Z"
}

app.get('/', (req, res) => { //.get is a one of the request methods. these methods always two parameters. one take the "/url" and the other is a callback function. callback always gives two parameters. one is request and the other is response.
// req to fetch the data and res to send the data/responce.
  res.send('<h1>Hello World!</h1>')
})

app.get('/about', (req, res) => { // multiple requests can be made on the same url.
    res.send('About Page')
})


app.get('/github', (req, res) =>{
  res.json(githubdata)
})

app.listen(port, () => { //this is the .listen method. this method takes two parameters. one is the port number and the other is a callback function. this is method that listens to the requests on the specified port number.
  console.log(`Example app listening on port ${port}`) // this state tells that the app is listening on the specified port number.
})