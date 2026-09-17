import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import http from "http";



const PORT = process.env.PORT || 8808;
// console.log("PORT:", process.env.PORT)

const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`)
})