const express = require('express');
require('dotenv').config();
const { userRouter } = require('./routes/user');
const {courseRouter} = require('./routes/course');
const {adminRouter} = require('./routes/admin');
const app = express();
const mongoose = require('mongoose');
const PORT=3000;
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:8080", 
  methods: ["GET", "POST"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/admin", adminRouter);



async function main(){
    await mongoose.connect(process.env.MONGO_URL);

    app.listen(PORT, function (req, res) {
      console.log("listening on port 3000..");
    });
}
 
main();