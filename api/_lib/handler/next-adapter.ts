import type { IncomingMessage, ServerResponse } from 'http';
import { EventEmitter } from 'events';

export type NextRouteHandler = (
  request: Request,
  context?: { params?: Record<string, string | string[]> }
) => Promise<Response>;

/**
 * Adapts universal Serverless API handler (Node req/res) to Next.js App Router Web Request/Response.
 */
export function toNextRoute(
  nodeHandler: (req: IncomingMessage, res: ServerResponse) => Promise<void>
): NextRouteHandler {
  return async function (
    request: Request,
    context?: { params?: Record<string, string | string[]> }
  ): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // Convert Web headers to Node-style record
    const headers: Record<string, string> = {};
    request.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    // Parse body if method allows
    let body: any = undefined;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      const contentType = headers['content-type'] || '';
      try {
        if (contentType.includes('application/json')) {
          body = await request.json();
        } else if (contentType.includes('text/')) {
          body = await request.text();
        } else {
          const text = await request.text();
          if (text) {
            try {
              body = JSON.parse(text);
            } catch {
              body = text;
            }
          }
        }
      } catch {
        body = undefined;
      }
    }

    // Parse query params
    const query: Record<string, string> = {};
    url.searchParams.forEach((val, key) => {
      query[key] = val;
    });
    if (context?.params) {
      for (const [k, v] of Object.entries(context.params)) {
        query[k] = Array.isArray(v) ? v.join('/') : v;
      }
    }

    return new Promise<Response>((resolve) => {
      const req: any = new EventEmitter();
      req.method = method;
      req.url = url.pathname + url.search;
      req.headers = headers;
      req.body = body;
      req.query = query;

      let statusCode = 200;
      const resHeaders = new Headers();
      let responseBody: any = null;
      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        resolve(
          new Response(responseBody, {
            status: statusCode || 200,
            headers: resHeaders,
          })
        );
      };

      const res: any = {
        statusCode,
        writableEnded: false,
        setHeader(k: string, v: string) {
          resHeaders.set(k, v);
        },
        getHeader(k: string) {
          return resHeaders.get(k);
        },
        status(code: number) {
          statusCode = code;
          this.statusCode = code;
          return this;
        },
        json(payload: any) {
          responseBody = JSON.stringify(payload);
          resHeaders.set('content-type', 'application/json; charset=utf-8');
          this.writableEnded = true;
          finish();
        },
        end(payload?: any) {
          if (payload !== undefined) {
            responseBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
          }
          this.writableEnded = true;
          finish();
        },
      };

      nodeHandler(req, res).catch((err) => {
        resolve(
          new Response(
            JSON.stringify({
              success: false,
              error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: err?.message || 'Internal Server Error',
              },
            }),
            {
              status: 500,
              headers: { 'content-type': 'application/json' },
            }
          )
        );
      });
    });
  };
}
