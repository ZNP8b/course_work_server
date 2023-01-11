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

    const DoctorsRequests = await db.query(
      "SELECT request_id FROM requests WHERE doctor_id = $1",
      [id]
    );

    for (let i = 0; i < DoctorsRequests.rows.length; i++) {
      await db.query("DELETE FROM diagnoses WHERE request_id = $1", [
        DoctorsRequests.rows[i].request_id,
      ]);
    }

    await db.query("DELETE FROM schedule WHERE doctor_id = $1", [id]);
    await db.query("DELETE FROM requests WHERE doctor_id = $1", [id]);

    res.json(user.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

router.get("/users", authorization, adminCheck, async (req, res) => {
  try {
    const pagesize = req.query.pagesize || 6;
    const page = (req.query.page - 1) * pagesize || 0;
    let search = "%";
    if (req.query.search) {
      search = req.query.search + "%";
    }

    const user = await db.query(
      "SELECT user_id, user_name, user_email FROM users WHERE user_role = $1 and user_name ilike $2 limit $3 offset $4",
      ["USER", search, pagesize, page]
    );

    res.json(user.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

router.delete("/users/:id", authorization, adminCheck, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.query(
      "DELETE from users WHERE user_id = $1 RETURNING *",
      [id]
    );

    const UsersRequests = await db.query(
      "SELECT request_id FROM requests WHERE user_id = $1",
      [id]
    );

    for (let i = 0; i < UsersRequests.rows.length; i++) {
      await db.query("DELETE FROM diagnoses WHERE request_id = $1", [
        UsersRequests.rows[i].request_id,
      ]);
    }

    await db.query("DELETE FROM requests WHERE user_id = $1", [id]);

    res.json(user.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

module.exports = router;
