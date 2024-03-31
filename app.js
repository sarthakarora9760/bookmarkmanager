import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import { uuid } from 'uuidv4';
import cors from 'cors'
import { bookmark } from "./models/bookmark.js";
import { User } from "./models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
const url = "mongodb+srv://sarthakarora9634:Adidas25%40@cluster0.ksbofmg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/bookmarkmanagement";
const port = 8080;
const app = express();
app.use(bodyParser.json());
app.use(cors());

let connection = await mongoose.connect(url);

// Register Route
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Protected Route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully' });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}

//Add bookmark route
app.post("/api/protected/addbookmark", async(req, res) => {

  const newbookmark = new bookmark({
    id: uuid(),
    url: req.body.url,
    title: req.body.title,
    category: req.body.category,
    uid: req.body.uid,
    timestamp : Date.now(),
    tags: req.body.tags
});
await newbookmark.save()
console.log(newbookmark)
res.send({"message":"Bookmark Saved successfully"})
});


//Get bookmarks count for a user id..
app.get("/api/protected/getbookmarkscount",async(req,res)=>{
  const count = await bookmark.countDocuments({uid:req.headers['uid']})
  res.send({"count":count})
})


//Get bookmarks for a user id..
app.get("/api/protected/getbookmarks",async(req,res)=>{
  
  const bookmarks= await bookmark.find({uid:req.headers['uid']})
  res.send(bookmarks)
})

app.get("/",(req,res)=>{
    res.send("Hello World")
});

app.listen(port, () => {
  console.log(`App listening on ${port}`);
});
