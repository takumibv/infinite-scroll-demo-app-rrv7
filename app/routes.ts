import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/with-custom-hooks", "routes/homeWithCustomHooks.tsx"),
  route("/api/articles", "routes/api/articles.ts"),
] satisfies RouteConfig;
