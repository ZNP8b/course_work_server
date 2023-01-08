const db = require("../db");

module.exports = async (req, res, next) => {
  try {

    const user = await db.query("SELECT user_role FROM users WHERE user_id = $1", [
        req.user,
      ]);

      if (user.rows[0].user_role !== 'ADMIN') {
        return (res.status(403).json("Not authorized"))
      }

    next();
  } catch (err) {
    console.log(err.message);
    return res.status(403).json("Not authorized");
  }
};
