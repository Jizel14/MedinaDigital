import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Skip Next internals and static assets, run on everything else
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
