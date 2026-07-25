import { expect, it } from "vitest";

import { apiErrorSchema } from "../src/index";

it("uses one public error envelope", () => {
  expect(
    apiErrorSchema.parse({
      error: {
        code: "INVALID_REQUEST",
        message: "请求无效",
        requestId: "req_1",
      },
    }),
  ).toEqual({
    error: {
      code: "INVALID_REQUEST",
      message: "请求无效",
      requestId: "req_1",
    },
  });
});
