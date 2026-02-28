const express = require("express");
const cors = require("cors");

const seatRoutes = require("./routes/seatRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/seats", seatRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});