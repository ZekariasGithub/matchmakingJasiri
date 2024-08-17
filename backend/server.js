const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bio TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err);
        }
      }
    );
  }
});

// Register user
app.post("/register", (req, res) => {
  const { name, bio } = req.body;
  db.run(
    `INSERT INTO users (name, bio) VALUES (?, ?)`,
    [name, bio],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Login user
app.post("/login", (req, res) => {
  const { name } = req.body;
  db.get(`SELECT * FROM users WHERE name = ?`, [name], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.status(200).json({ id: row.id, name: row.name, bio: row.bio });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
