import { createServer } from "vite";

const server = await createServer({
  root: "D:/DATN/admin-FE",
  configFile: "D:/DATN/admin-FE/vite.config.ts",
  server: {
    host: "127.0.0.1",
    port: 5180,
    strictPort: true,
  },
});

await server.listen();
setInterval(() => {}, 1_000_000);
