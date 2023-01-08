const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");
const doctorCheck = require("../middleware/doctorCheck");

router.post("/add", authorization, async (req, res) => {
  try {
    const { request_title, request_description } = req.body;

    const newRequest = await db.query(
      "INSERT INTO requests (user_id, request_title, request_description) VALUES ($1, $2, $3) RETURNING *",
      [req.user, request_title, request_description]
    );

    res.json(newRequest.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/get", authorization, async (req, res) => {
  try {
    const getRequests = await db.query(
      "SELECT * FROM requests where user_id = $1",
      [req.user]
    );

    res.json(getRequests.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/getAccepted", authorization, async (req, res) => {
  try {
    const getAcceptedRequests = await db.query(
      "SELECT requests.request_id, requests.user_id, requests.doctor_id, users.user_name, requests.request_title, requests.request_description, requests.doctor_message FROM requests JOIN users ON doctor_id = users.user_id WHERE requests.user_id = $1",
      [req.user]
    );

    res.json(getAcceptedRequests.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

router.delete("/delete/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;

    const user_id = await db.query(
      "SELECT user_id FROM requests WHERE request_id = $1",
      [id]
    );

    if (user_id.rows[0].user_id === req.user) {
      const deleteRequest = await db.query(
        "DELETE FROM requests WHERE request_id = $1 RETURNING *",
        [id]
      );
      await db.query("DELETE FROM diagnoses WHERE request_id = $1", [id]);
      res.json(deleteRequest.rows[0]);
    } else {
      res.status(403).json("Not authorized");
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

router.get("/doctorGet", authorization, doctorCheck, async (req, res) => {
  try {
    const getRequests = await db.query(
      "SELECT requests.request_id, requests.user_id, requests.doctor_id, users.user_name, requests.request_title, requests.request_description, requests.doctor_message FROM (requests JOIN users ON requests.user_id = users.user_id) ORDER BY requests.doctor_id DESC limit 6"
    );

    res.json(getRequests.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/doctorSign/:id", authorization, doctorCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_message } = req.body;

    const updateRequests = await db.query(
      "UPDATE requests SET doctor_id= $1, doctor_message= $2 WHERE request_id = $3 RETURNING *",
      [req.user, doctor_message, id]
    );

    res.json(updateRequests.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

router.put(
  "/doctorUnSign/:id",
  authorization,
  doctorCheck,
  async (req, res) => {
    try {
      const { id } = req.params;

      const updateRequests = await db.query(
        "UPDATE public.requests SET doctor_id=null, doctor_message=null WHERE request_id = $1 RETURNING *",
        [id]
      );

      await db.query("DELETE FROM diagnoses WHERE request_id = $1", [id]);

      res.json(updateRequests.rows);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

router.get(
  "/getSignedDoctorRequests",
  authorization,
  doctorCheck,
  async (req, res) => {
    try {
      const pagesize = req.query.pagesize || 3;
      const page = (req.query.page - 1) * pagesize || 0;
      let search = "%";
      if (req.query.search) {
        search = req.query.search + "%";
      }

      const getSignedDoctorRequests = await db.query(
        "SELECT requests.request_id, requests.user_id, requests.doctor_id, users.user_name, requests.request_title, requests.request_description, requests.doctor_message FROM requests JOIN users ON requests.user_id = users.user_id WHERE requests.doctor_id = $1 and user_name ilike $2 limit $3 offset $4",
        [req.user, search, pagesize, page]
      );

      res.json(getSignedDoctorRequests.rows);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
