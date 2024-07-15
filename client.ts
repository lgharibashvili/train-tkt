import z from "zod";

const TKT_GATEWAY = "https://gateway.tkt.ge/v2/gr/";
const API_KEY = "7d8d34d1-e9af-4897-9f0f-5c36c179be77";

const Response = z.object({
  Success: z.boolean(),
  Errors: z.array(
    z.object({
      ErrorType: z.number(),
      Description: z.string(),
    }),
  ),
  ErrorCode: z.number(),
  Data: z.unknown(),
});

class Client {
  private async request(
    method: "GET" | "POST",
    route: string,
    params?: Record<string, string>,
    body?: Record<string, unknown>,
  ) {
    const url =
      TKT_GATEWAY +
      route +
      "?" +
      new URLSearchParams({
        ...params,
        api_key: API_KEY,
      });
    const res = await fetch(url, {
      method,
      headers: {
        ...(body && {
          "Content-Type": "application/json",
        }),
        "Accept-Language": "en-US;en",
      },
      body: body && JSON.stringify(body),
    });
    const response = await res
      .json()
      //.then(log)
      .then((data) => Response.parse(data));
    if (!response.Success) {
      throw new Error(response.Errors.map((err) => err.Description).join("; "));
    }
    return response.Data;
  }

  async get(route: string, params?: Record<string, string>) {
    return this.request("GET", route, params);
  }

  async post(
    route: string,
    body?: Record<string, unknown>,
    params?: Record<string, string>,
  ) {
    return this.request("POST", route, params, body);
  }
}

export const client = new Client();
