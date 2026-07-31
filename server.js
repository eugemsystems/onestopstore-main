// cPanel Passenger/Node.js entry point for Next.js
// This file should be placed at the root of your store deployment on cPanel

// Load .env.local manually (Passenger doesn't auto-load .env files)
const path = require("path");
const fs = require("fs");

// Load .env.local if it exists
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    // Skip comments and empty lines
    line = line.trim();
    if (!line || line.startsWith("#")) return;
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      let value = valueParts.join("=").trim();
      // Remove surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      // Only set if not already defined (don't override system env vars)
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
}

// NOTE: Disabling TLS is a security risk. Only use as a TEMPORARY workaround.\n// Fix your cPanel SSL certificate chain instead.\n// process.env.NODE_TLS_REJECT_UNAUTHORIZED = \"0\";

const dns = require("dns");

// Get the API hostname to patch DNS for
// This fixes "getaddrinfo ENOTFOUND" errors on cPanel shared hosting
const API_HOSTNAME = (() => {
  try {
    const apiUrl =
      process.env.NEXT_SERVER_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "";
    return new URL(apiUrl).hostname;
  } catch {
    return "";
  }
})();

// The IP address of this server. Set SERVER_IP in .env.local or it defaults
// to the known IP. Find yours in cPanel → Server Information or run: curl ifconfig.me
const SERVER_IP = process.env.SERVER_IP || "165.99.164.114";

// Patch dns.lookup so Node.js can resolve the API subdomain on this server
// Without this, cPanel shared hosting returns ENOTFOUND for its own subdomains
if (API_HOSTNAME) {
  const origLookup = dns.lookup.bind(dns);
  dns.lookup = function (hostname, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    // If looking up our own API hostname, resolve to the server's IP
    if (hostname === API_HOSTNAME) {
      if (typeof options === "object" && options.all) {
        return callback(null, [{ address: SERVER_IP, family: 4 }]);
      }
      return callback(null, SERVER_IP, 4);
    }
    return origLookup(hostname, options, callback);
  };
  console.log(`> DNS patch: ${API_HOSTNAME} → ${SERVER_IP}`);
}

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false;
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> API Base URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`);
      console.log(
        `> Server API URL: ${process.env.NEXT_SERVER_API_BASE_URL || "not set (using public URL)"}`,
      );
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js app:", err);
    process.exit(1);
  });
