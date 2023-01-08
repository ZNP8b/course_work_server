const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");
const adminCheck = require("../middleware/adminCheck");
const e = require("express");

router.get("/doctors", authorization, adminCheck, async (req, res) => {
  try {
    const pagesize = req.query.pagesize || 3;
    const page = (req.query.page - 1) * pagesize || 0;
    let search = "%";
    if (req.query.search) {
      search = req.query.search + "%";
    }

    const user = await db.query(
      "SELECT user_id, user_name, user_email FROM users WHERE user_role = $1 and user_name ilike $2 limit $3 offset $4",
      ["DOCTOR", search, pagesize, page]
    );

    res.json(user.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

router.get("/doctors/:id", authorization, adminCheck, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query(
      "SELECT user_name, user_email FROM users WHERE user_id = $1",
      [id]
    );

    res.json(user.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

router.delete("/doctors/:id", authorization, adminCheck, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query(
      "DELETE from users WHERE user_id = $1 RETURNING *",
      [id]
    );

    res.json(user.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

module.exports = router;
