/**
 * Example Cloudflare Pages Function
 *
 * This will be available at: /api/hello
 *
 * Context includes: env (bindings), request, waitUntil, etc.
 * https://developers.cloudflare.com/pages/functions/advanced-mode/#the-context-object
 */
export async function onRequest(context: {
  request: Request;
  env: { [key: string]: any };
}): Promise<Response> {
  const { request, env } = context;

  // Handle different HTTP methods
  if (request.method === "GET") {
    return Response.json({
      message: "Hello from Cloudflare Pages Function!",
      timestamp: new Date().toISOString(),
    });
  }

  if (request.method === "POST") {
    const body = await request.json();
    return Response.json({
      message: "Received your data",
      data: body,
    });
  }

  return new Response("Method not allowed", { status: 405 });
}
