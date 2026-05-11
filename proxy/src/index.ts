export interface Env {
  DB: D1Database;
  D1_PROXY_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.D1_PROXY_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { sql, params, method } = await request.json<any>();

      const stmt = env.DB.prepare(sql).bind(...params);

      if (method === "all" || method === "values") {
        const result = await stmt.all();
        // Critical: Drizzle ORM sqlite-proxy expects an array of values, not objects!
        const rows = (result.results || []).map(row => Object.values(row));
        return Response.json({ rows });
      } else if (method === "get") {
        const result = await stmt.first();
        if (result === null) {
          return Response.json({ rows: [] }); // Critical for Drizzle: return empty array instead of null
        }
        return Response.json({ rows: [Object.values(result)] });
      } else if (method === "run") {
        const result = await stmt.run();
        // .run() doesn't return mapped rows, but we can return results if any
        const rows = (result.results || []).map(row => Object.values(row));
        return Response.json({ rows });
      } else {
        return Response.json({ error: "Unknown method" }, { status: 400 });
      }
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  },
};
