const express = require("express");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 5000;

//middleware

app.use(express.json());
app.use(cors());

// ROUTES

//register and login routes

app.use("/auth", require("./routes/jwtAuth"));

//dashboard route

app.use("/dashboard", require("./routes/dashboard"));

app.use("/adminpanel", require("./routes/adminpanel"));

app.use("/requests", require("./routes/requests"));

app.use("/diagnoses", require("./routes/diagnoses"));

app.use("/schedule", require("./routes/schedule"));

app.listen(PORT, () => {
  console.log("Server started on port: ", PORT);
});
