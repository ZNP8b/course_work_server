const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");
const doctorCheck = require("../middleware/doctorCheck");

router.get("/get", authorization, async (req, res) => {
  try {
    let search = "%";
    if (req.query.search) {
      search = req.query.search + "%";
    }
    const doctorSchedules = await db.query(
      "SELECT schedule.doctor_id, schedule.schedule_monday, schedule.schedule_tuesday, schedule.schedule_wednesday, schedule.schedule_thursday, schedule.schedule_friday, users.user_name, users.user_email FROM schedule JOIN users ON schedule.doctor_id = users.user_id WHERE users.user_name ILIKE $1",
      [search]
    );

    res.json(doctorSchedules.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

router.get("/getYourSchedule", authorization, doctorCheck, async (req, res) => {
  try {
    const YourSchedule = await db.query(
      "SELECT schedule.doctor_id, schedule.schedule_monday, schedule.schedule_tuesday, schedule.schedule_wednesday, schedule.schedule_thursday, schedule.schedule_friday, users.user_name, users.user_email FROM schedule JOIN users ON schedule.doctor_id = users.user_id WHERE schedule.doctor_id = $1",
      [req.user]
    );

    res.json(YourSchedule.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

router.post(
  "/changeYourSchedule",
  authorization,
  doctorCheck,
  async (req, res) => {
    try {
      const {
        schedule_monday,
        schedule_tuesday,
        schedule_wednesday,
        schedule_thursday,
        schedule_friday,
      } = req.body;

      const doctorSchedules = await db.query(
        "UPDATE schedule SET schedule_monday=$1, schedule_tuesday=$2, schedule_wednesday=$3, schedule_thursday=$4, schedule_friday=$5 WHERE doctor_id = $6 RETURNING *",
        [
          schedule_monday,
          schedule_tuesday,
          schedule_wednesday,
          schedule_thursday,
          schedule_friday,
          req.user,
        ]
      );

      res.json(doctorSchedules.rows);
    } catch (err) {
      console.log(err.message);
      res.status(500).json("Server error");
    }
  }
);

module.exports = router;
