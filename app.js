const fastify = require("fastify");
const dotenv = require("dotenv");
const cors = require("@fastify/cors");
const jwt = require("jsonwebtoken");
const path = require("path");

// Import your route modules
const Admin = require("./src/routes/Admin");
// const Company = require("./src/routes/Company");
// const Student = require("./src/routes/Student");

dotenv.config() ;

const serverPort = process.env.PORT || 4000;
const server = fastify({ logger: true, bodyLimit: 52428800 });

console.log(">>>>>>>>>>>>>>>> Password", process.env.DB_PASSWORD);

const allowedOrigins = [];

// Register multipart
try {
  server.register(require("@fastify/multipart"));
} catch (err) {
  console.error("Failed to register @fastify/multipart:", err);
  process.exit(1);
}

// Register CORS
server.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
});

// Custom JSON parser
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

// JWT plugin
server.register(require("@fastify/jwt"), {
  secret: process.env.JWT_SECRET_KEY,
});

// Auth hook (basic verification)
server.addHook("onRequest", async (request, reply) => {
  if (request.routerPath === "/adminlogin") {
    return; // ✅ skip JWT check for login route
  }
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Auth hook (with public route handling)
server.addHook("onRequest", async (request, reply) => {
  const publicPrefixes = ["/adminlogin"];
  const requestPath = request.routerPath || request.raw.url;
  const isPublicRoute = publicPrefixes.some((prefix) =>
    requestPath?.startsWith(prefix)
  );

  if (isPublicRoute) {
    return; // Skip auth for public routes
  }

  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return reply.status(401).send({ error: "Token not provided" });
    }
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "secret-key"
    );
    request.user = decodedToken;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return reply.status(401).send({ error: "Invalid or expired token" });
  }
});

// Register routes
server.register(Admin);
// server.register(Student);
// server.register(Company);

const options = {
  port: Number(serverPort),
  host: "0.0.0.0",
};

// Start server
async function startServer() {
  try {
    try {
      await server.listen(options);
      console.log(`✅ Server listening on ${options.host}:${options.port}`);
    } catch (serverError) {
      console.error("❌ Error starting server:", serverError);
      process.exit(1);
    }
  } catch (err) {
    console.error("Unexpected error during server startup:", err);
    process.exit(1);
  }
}

startServer();
