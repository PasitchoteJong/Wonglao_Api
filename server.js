import dotenv from "dotenv";
import app from "./app.js";
import http from "http";

dotenv.config()

const PORT = process.env.PORT || 8000;
// console.log("PORT:", process.env.PORT)

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})