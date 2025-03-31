import { healthCheckHandler, healthCheckResponse } from "@serverx/server";
import { httpMethods } from "@serverx/utils";

export const tags = [];
export const path = "/healthcheck";
export const method = httpMethods.GET;
export const description = "Returns healthcheck status";

function checkDb() {
  return Promise.resolve(true);
}

export function handler() {
  return healthCheckHandler({
    dependencies: [{
      name: "db",
      check: checkDb,
    }],
  });
}

export const responses = healthCheckResponse();
