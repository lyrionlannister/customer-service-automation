import { describe, expect, it } from "vitest";
import { parseErrorMessage } from "../../../src/modules/whatsapp/utils/whatsapp.utils";

describe("parseErrorMessage", () => {
  it("returns the server's error field when present", async () => {
    const response = new Response(JSON.stringify({ error: "Credenciales invalidas" }));
    await expect(parseErrorMessage(response, "fallback")).resolves.toBe(
      "Credenciales invalidas",
    );
  });

  it("falls back when the body has no error field", async () => {
    const response = new Response(JSON.stringify({}));
    await expect(parseErrorMessage(response, "fallback")).resolves.toBe("fallback");
  });

  it("falls back when the body isn't valid JSON", async () => {
    const response = new Response("not json");
    await expect(parseErrorMessage(response, "fallback")).resolves.toBe("fallback");
  });
});
