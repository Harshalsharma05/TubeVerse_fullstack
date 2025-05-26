import dotenv from 'dotenv'
dotenv.config() // Load environment variables from .env file
import express from 'express' // Importing express module for creating server

const app = express() // Creating an instance of express

const port = process.env.PORT || 4000 // Defining the port number server will listen on 3000 port

const githubData = {

  "login": "Harshalsharma05",
  "id": 150684514,
  "node_id": "U_kgDOCPtDYg",
  "avatar_url": "https://avatars.githubusercontent.com/u/150684514?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/Harshalsharma05",
  "html_url": "https://github.com/Harshalsharma05",
  "followers_url": "https://api.github.com/users/Harshalsharma05/followers",
  "following_url": "https://api.github.com/users/Harshalsharma05/following{/other_user}",
  "gists_url": "https://api.github.com/users/Harshalsharma05/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/Harshalsharma05/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/Harshalsharma05/subscriptions",
  "organizations_url": "https://api.github.com/users/Harshalsharma05/orgs",
  "repos_url": "https://api.github.com/users/Harshalsharma05/repos",
  "events_url": "https://api.github.com/users/Harshalsharma05/events{/privacy}",
  "received_events_url": "https://api.github.com/users/Harshalsharma05/received_events",
  "type": "User",
  "user_view_type": "public",
  "site_admin": false,
  "name": "HarshalSharma_07",
  "company": null,
  "blog": "",
  "location": null,
  "email": null,
  "hireable": null,
  "bio": null,
  "twitter_username": null,
  "public_repos": 6,
  "public_gists": 0,
  "followers": 2,
  "following": 1,
  "created_at": "2023-11-13T13:09:57Z",
  "updated_at": "2025-05-23T09:59:40Z"
}

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

app.get('/github', (req, res) => {
    res.json(githubData)
})

app.listen(port, () => {
  console.log(`Server is running on port: http://localhost:${port}`)
})