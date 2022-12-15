const router = require("express").Router();
const db = require("../db");
const authorization = require("../middleware/authorization");

router.get("/", authorization, async (req, res) => {
  try {
    // req.user has the payload (our payload is user_id)
    //res.json(req.user);

    const user = await db.query("SELECT user_name, user_role FROM users WHERE user_id = $1", [
      req.user,
    ]);

    res.json(user.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
});

module.exports = router;
