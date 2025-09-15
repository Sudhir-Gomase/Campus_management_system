import fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import path from "path";
import multipart from "@fastify/multipart";
import fastifyJwt from "@fastify/jwt";

// Routes
import Admin from "./src/routes/Admin/index.js";
// import Company from "./src/routes/Company/index.js";
import Student from "./src/routes/Student/index.js";

// Load environment variables
dotenv.config();

const serverPort = process.env.PORT || 4000;
const server = fastify({ logger: true, bodyLimit: 52428800 });

// Debug: check env
console.log(">>>>>>>> DB Password:", process.env.DB_PASSWORD);

// ✅ Register multipart
server.register(multipart);


// ✅ Register CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000"
]; // Add allowed frontend URLs if needed
server.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
});

// ✅ JSON body parser with error handling
server.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  function (req, body, done) {
    try {
      const json = JSON.parse(body);
      done(null, json);
    } catch (err) {
      err.statusCode = 400;
      done(err, undefined);
    }
  }
);

// ✅ JWT plugin
server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET_KEY || "default-secret",
});

// ✅ JWT Auth Hook (protect all except login)
server.addHook("onRequest", async (request, reply) => {
  const publicRoutes = ["/adminlogin", "/studentlogin"];
  const path = request.routerPath || request.raw.url;

  if (publicRoutes.some(route => path.startsWith(route))) {
    return; // Skip JWT verification for public routes
  }
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: "Invalid or missing token" });
  }
});

// ✅ Register routes
server.register(Admin);
server.register(Student);
// server.register(Company);

// ✅ Start server
const options = {
  port: Number(serverPort),
  host: "0.0.0.0",
};

async function startServer() {
  try {
    await server.listen(options);
    console.log(`✅ Server running at http://${options.host}:${options.port}`);
  } catch (err) {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  }
}

startServer();
