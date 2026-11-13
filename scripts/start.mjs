import { spawn } from "node:child_process";

const port = process.env.PORT || "3000";
const child = spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));

if (process.env.DATABASE_URL && process.env.SKIP_DB_PUSH !== "1") {
  const push = spawn("npx", ["prisma", "db", "push", "--skip-generate"], {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  push.on("error", () => {
    // The site keeps serving seed data when the database is unreachable.
  });
}
