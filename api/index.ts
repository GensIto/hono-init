import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { decode, jwt, sign } from "hono/jwt";
import { handle } from "hono/vercel";

export const config = {
  runtime: "edge",
};

type User = {
  name: string;
  email: string;
  password: string;
};

const app = new Hono().basePath("/api");
const JWT_TOKEN = "honoisacool";

app.post("/login", async (c) => {
  const body = await c.req.json<User>();

  const token = await sign(body, JWT_TOKEN);
  await setCookie(c, "jwt_token", token);

  return c.json(body);
});

app.get("/logout", async (c) => {
  await deleteCookie(c, "jwt_token");
  return c.json({ message: "Logged out" });
});

app.use(
  "/auth/*",
  jwt({
    secret: JWT_TOKEN,
    cookie: "jwt_token",
  })
);

app.get("/auth/page", async (c) => {
  const token = await getCookie(c, "jwt_token");
  if (!token) return c.json({ message: "Not logged in" });

  const { payload } = decode(token);
  return c.json(payload);
});

export default handle(app);
