import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getContractByPaymentToken: vi.fn(),
}));

import * as db from "./db";
import { pocRouter } from "./poc";

describe("poc.getContract", () => {
  it("returns null when a paid demo order has not created its contract yet", async () => {
    vi.mocked(db.getContractByPaymentToken).mockResolvedValueOnce(undefined);
    const caller = pocRouter.createCaller({} as never);

    await expect(caller.getContract({ token: "t".repeat(20) })).resolves.toBeNull();
  });
});
