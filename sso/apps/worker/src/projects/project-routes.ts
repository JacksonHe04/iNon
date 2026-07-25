import { Hono } from "hono";
import type { AppBindings } from "../env";
import { ProjectService } from "./project-service";

export function createProjectRoutes() {
  const routes = new Hono<AppBindings>();

  routes.get("/projects", async (context) => {
    const projects = await new ProjectService(context.env.DB).list();
    return context.json({ projects });
  });

  return routes;
}
