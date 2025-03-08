import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const protectedRoutes = ['/profile', '/orders'];
const adminRoutes = ['/admin'];
const authRoutes = ['/register'];
const API_URL = 'http://127.0.0.1:8000/api';

async function isAdmin(token: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/auth/is-admin/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.is_staff === true;
      } catch (error) {
        console.error('Admin check error:', error);
        return false;
      }
    }
    
    export async function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;
    if (adminRoutes.some(route => pathname.startsWith(route))) {
        if (!token) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
        const isAdminResult = await isAdmin(token);
        if (!isAdminResult) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
      if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!token) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
      if (authRoutes.some(route => pathname.startsWith(route))) {
        if (token) {
          return NextResponse.redirect(new URL('/profile', request.url));
        }
      }
      return NextResponse.next();
}
export const config = {
    matcher: ['/profile/:path*', '/orders/:path*', '/admin/:path*', '/login', '/register'],
};























