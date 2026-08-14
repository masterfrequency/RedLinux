import { describe, it, expect } from "vitest";
import {
  MicrosoftUpdateProfile,
  SlackProfile,
  MalleableEngine,
} from "./malleableC2";

describe("MalleableEngine.transformResponse", () => {
  it("wraps data with profile prepend/append", () => {
    const data = "beacon-data";
    const out = MalleableEngine.transformResponse(data, MicrosoftUpdateProfile);
    expect(out).toContain(data);
    expect(out).toMatch(/\*\/$/); // noise comment suffix
  });
});

describe("MalleableEngine.extractMetadata", () => {
  it("decodes hex metadata from the Microsoft profile's id param", () => {
    const req = { query: { id: Buffer.from("agent-7f3a").toString("hex") } };
    const out = MalleableEngine.extractMetadata(req, MicrosoftUpdateProfile);
    expect(out).toBe("agent-7f3a");
  });

  it("decodes base64 metadata from the Slack profile's token param", () => {
    const req = {
      query: { token: Buffer.from("hex-agent").toString("base64") },
    };
    const out = MalleableEngine.extractMetadata(req, SlackProfile);
    expect(out).toBe("hex-agent");
  });

  it("returns empty string when param missing or garbage", () => {
    expect(
      MalleableEngine.extractMetadata({ query: {} }, MicrosoftUpdateProfile),
    ).toBe("");
    expect(
      MalleableEngine.extractMetadata(
        { query: { id: "zzzz" } },
        MicrosoftUpdateProfile,
      ),
    ).toBe("");
  });
});

describe("malleable profiles", () => {
  it("profiles define httpGet server output blocks", () => {
    for (const profile of [MicrosoftUpdateProfile, SlackProfile]) {
      expect(profile.httpGet.server.output.prepend).toBeDefined();
      expect(profile.httpGet.server.output.append).toBeDefined();
      expect(profile.httpGet.client.metadata.parameter).toBeTruthy();
      expect(["base64", "hex"]).toContain(
        profile.httpGet.client.metadata.encoding,
      );
    }
  });

  it("profiles are distinct", () => {
    expect(MicrosoftUpdateProfile.name).not.toBe(SlackProfile.name);
  });
});
