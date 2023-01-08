const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");
const doctorCheck = require("../middleware/doctorCheck");
const adminCheck = require("../middleware/adminCheck");

router.post("/add", authorization, doctorCheck, async (req, res) => {
  try {
    const { request_id, request_diagnose, diagnose_message } = req.body;

    const existedDiagnose = await db.query(
      "SELECT COUNT(request_id) from diagnoses where request_id = $1",
      [request_id]
    );

    let diagnose = [];

    if (existedDiagnose.rows[0].count == 1) {
      await db.query("DELETE FROM diagnoses WHERE request_id = $1", [
        request_id,
      ]);
    }

    diagnose = await db.query(
      "INSERT INTO diagnoses(request_id, request_diagnose, diagnose_message) VALUES ($1, $2, $3) RETURNING *",
      [request_id, request_diagnose, diagnose_message]
    );

    res.json(diagnose.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

router.get("/getAll", authorization, adminCheck, async (req, res) => {
  try {
    //const { id } = req.params;

    const diagnose = await db.query(
      "SELECT diagnoses.request_id, diagnoses.request_diagnose, diagnoses.diagnose_message, users.user_name AS doctor_name, requests.user_id, requests.doctor_id, requests.doctor_message, requests.request_title, requests.request_description FROM diagnoses JOIN requests ON diagnoses.request_id = requests.request_id JOIN users ON requests.doctor_id = users.user_id"
    );

    res.json(diagnose.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

router.get("/get", authorization, async (req, res) => {
  try {
    const diagnose = await db.query(
      "SELECT diagnoses.request_id, diagnoses.request_diagnose, diagnoses.diagnose_message, users.user_name AS doctor_name, requests.user_id, requests.doctor_id, requests.doctor_message, requests.request_title, requests.request_description FROM diagnoses JOIN requests ON diagnoses.request_id = requests.request_id JOIN users ON requests.doctor_id = users.user_id WHERE requests.user_id = $1",
      [req.user]
    );

    res.json(diagnose.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

router.get("/getDiagnose/:id", authorization, doctorCheck, async (req, res) => {
    try {
        const { id } = req.params;

      const diagnose = await db.query(
        "SELECT diagnoses.request_id, diagnoses.request_diagnose, diagnoses.diagnose_message FROM diagnoses JOIN requests ON diagnoses.request_id = requests.request_id JOIN users ON requests.doctor_id = users.user_id WHERE diagnoses.request_id = $1",
        [id]
      );
  
      res.json(diagnose.rows);
    } catch (err) {
      console.log(err.message);
      res.status(500).json("Server error");
    }
  });

router.delete("/delete/:id", authorization, doctorCheck, async (req, res) => {
  try {
    const { id } = req.params;

    const doctor_id = await db.query(
      "SELECT doctor_id FROM requests WHERE request_id = $1",
      [id]
    );

    if (doctor_id.rows[0].doctor_id === req.user) {
      const diagnose = await db.query(
        "DELETE FROM diagnoses WHERE request_id = $1 RETURNING *",
        [id]
      );
      res.json(diagnose.rows[0]);
    } else {
      res.status(403).json("Not authorized");
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

module.exports = router;
