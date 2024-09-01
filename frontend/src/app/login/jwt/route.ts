import { type NextRequest, NextResponse } from 'next/server';

export function GET(req: NextRequest): NextResponse {
  const oAuthToken = req.nextUrl.searchParams.get('jwt');
  if (oAuthToken) {
    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.set({
      name: 'jwt',
      value: oAuthToken.toString(),
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  }

  return NextResponse.next();
}
