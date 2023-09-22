const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
app.use(express.json());

const posts = [
  {
    user:"mano",
    title: "post1",
  },
  {
    user:"sundar",
    title: "post2",
  },
  
];

let refreshTokenList = []


app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter(post=> post.user === req.user.name));
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefershToken(user);
  refreshTokenList.push(refreshToken);
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

function generateAccessToken(user) {
  const accessToken = jwt.sign(user , process.env.SECRET_ACCESS_TOKEN, {expiresIn:'30s'});
  return accessToken;
}

function generateRefershToken(user)
{
  const refreshToken = jwt.sign(user, process.env.REFERESH_ACCESS_TOKEN);
  return refreshToken;
}

app.post("/token",(req, res)=>{
 const refreshToken = req.body.refreshToken
 if(refreshToken == null) return res.sendStatus(401)
 if(!refreshTokenList.includes(refreshToken)) return res.sendStatus(403)

 jwt.verify(refreshToken,process.env.REFERESH_ACCESS_TOKEN,(err , user)=>{
  if(err) return res.sendStatus(403)
  console.log(user)
  const accessToken = generateAccessToken({name: user.name})
  res.json({accessToken : accessToken })
 })
})

app.delete("/logout",(req, res)=>{
  refreshTokenList  = refreshTokenList.filter(token => token !== req.body.token)
  res.sendStatus(204)

})


function authenticateToken(req, res, next) { 

  const authHeader = req.headers["authorization"];
  
 
  if (authHeader && authHeader.startsWith("Bearer")) {
    
    const token = authHeader.split(' ')[1];
    
   
    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, user) => {  
      if (err) {
        return res.sendStatus(403);
      }
      console.log("Decoded User:", user); 
      req.user = user;
      next(); 
    });
  } else {
    return res.sendStatus(401); 
  }
}


app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

