import Router from "@koa/router";
import auth from "./auth";

const routes = new Router();

routes.use("/auth", auth.routes());

export default routes;
