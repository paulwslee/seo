export interface Env {
  DB: D1Database;
  D1_PROXY_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // --- NEW: Web Scraper Proxy Endpoint ---
    if (url.pathname === "/scrape" && request.method === "GET") {
      const targetUrl = url.searchParams.get("url");
      const secret = url.searchParams.get("secret");

      if (secret !== env.D1_PROXY_SECRET) {
        return new Response("Unauthorized Scraper", { status: 401 });
      }
      if (!targetUrl) {
        return new Response("Missing url param", { status: 400 });
      }

      try {
        const res = await fetch(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
          }
        });
        const html = await res.text();
        
        // Pass along the target's headers
        const headers = new Headers();
        headers.set("Content-Type", "text/html; charset=utf-8");
        headers.set("X-Target-Status", res.status.toString());
        if (res.headers.get("server")) headers.set("server", res.headers.get("server")!);
        
        return new Response(html, { status: res.status, headers });
      } catch (e: any) {
        return new Response(e.message, { status: 500 });
      }
    }

    // --- EXISTING: D1 Database Proxy ---
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
