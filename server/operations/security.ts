import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const sessionToken = randomBytes(32).toString('hex');
export const localPort = Number(process.env.PORT || 3000);
if (!Number.isInteger(localPort) || localPort < 1 || localPort > 65535) throw new Error('Invalid PORT.');
const allowedHosts = new Set([`127.0.0.1:${localPort}`, `localhost:${localPort}`]);

export function loopbackSecurity(req: Request, res: Response, next: NextFunction) {
  const remote = req.socket.remoteAddress;
  const host = req.headers.host;
  const origin = req.headers.origin;
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote || '') || !allowedHosts.has(host || '') ||
      (origin !== undefined && origin !== `http://${host}`) || req.headers['sec-fetch-site'] === 'cross-site') {
    return res.status(403).json({ error: 'FORBIDDEN_ORIGIN' });
  }
  next();
}

export function issueSession(req: Request, res: Response) {
  // A custom header prevents cross-origin simple requests. No CORS permission is granted.
  if (req.headers['x-toolkit-client'] !== 'akshigo-ui') return res.status(403).json({ error: 'FORBIDDEN_CLIENT' });
  res.setHeader('Cache-Control', 'no-store');
  res.json({ token: sessionToken });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-toolkit-auth'];
  if (typeof token !== 'string' || Buffer.byteLength(token) !== Buffer.byteLength(sessionToken) || !timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken))) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  next();
}
