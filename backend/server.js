const express = require("express");
const path = require("path"); // <--- 1. เพิ่มตัวช่วยจัดการ Path
const bookRoutes = require("./src/presentation/routes/bookRoutes");
const corsMiddleware = require("./src/presentation/middlewares/cors");
const errorHandler = require("./src/presentation/middlewares/errorHandler");

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/books", bookRoutes);
app.use(errorHandler);

const PORT = 3000;
const HOST = "0.0.0.0";

// 🔑 IP ของ VM (ถูกต้องแล้ว)
const VM_IP = "192.168.56.102";

app.listen(PORT, HOST, () => {
  console.log("\n🚀 Backend API is running!");
  console.log("────────────────────────────");
  console.log(`🔗 Website  : http://${VM_IP}:${PORT}`); // เข้าหน้านี้จะเจอเว็บ
  console.log(`📚 Books API: http://${VM_IP}:${PORT}/api/books`);
  console.log("────────────────────────────\n");
});