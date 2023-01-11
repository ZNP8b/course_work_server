const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");
const adminCheck = require("../middleware/adminCheck");

router.get("/", authorization, adminCheck, async (req, res) => {
  try {
    const users = await db.query(
      "SELECT COUNT(user_id) FROM users WHERE user_role = 'USER'"
    );

    const doctors = await db.query(
      "SELECT COUNT(user_id) FROM users WHERE user_role = 'DOCTOR'"
    );

    const admins = await db.query(
      "SELECT COUNT(user_id) FROM users WHERE user_role = 'ADMIN'"
    );

    const allUsers = await db.query("SELECT COUNT(user_id) FROM users");

    const requests = await db.query("SELECT COUNT(request_id) FROM requests");

    const acceptedRequests = await db.query(
      "SELECT COUNT(request_id) FROM requests WHERE doctor_id IS NOT NULL"
    );

    const notAcceptedRequests = await db.query(
      "SELECT COUNT(request_id) FROM requests WHERE doctor_id IS NULL"
    );

    const diagnoses = await db.query(
        "SELECT COUNT(request_id) FROM diagnoses"
      );

    result = {
      ["Users"]: users.rows[0].count,
      ["Doctors"]: doctors.rows[0].count,
      ["Admins"]: admins.rows[0].count,
      ["AllUsers"]: allUsers.rows[0].count,
      ["Requests"]: requests.rows[0].count,
      ["AcceptedRequests"]: acceptedRequests.rows[0].count,
      ["NotAcceptedRequests"]: notAcceptedRequests.rows[0].count,
      ["Diagnoses"]: diagnoses.rows[0].count,
    };

    res.json(result);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

module.exports = router;
