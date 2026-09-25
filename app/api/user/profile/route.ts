import handler from '@/api/user/profile';
import { toNextRoute } from '@/api/_lib/handler/next-adapter';

const route = toNextRoute(handler);

export const GET = route;
export const POST = route;
export const PUT = route;
export const PATCH = route;
export const DELETE = route;
export const OPTIONS = route;
