require("dotenv").config();
const express = require("express");
const cors = require("cors");
const chatbotRoutes = require("./routes/chatbot");
const financeRoutes = require("./routes/financeRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chatbot", chatbotRoutes);
app.use("/api/finance", financeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
