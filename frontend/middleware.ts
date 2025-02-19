import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';

// Define protected and auth routes
const protectedRoutes = ['/profile', '/orders'];
const adminRoutes = ['/admin', '/admin/:path*']; // Include all admin subroutes
const authRoutes = ['/register'];

const API_URL = 'http://127.0.0.1:8000/api';

// Function to check if user is admin using fetchWithAuth
async function isAdmin(token: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/auth/is-admin/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            return Boolean(data.is_staff);
        }

        // Try to refresh token if response is 401
        if (response.status === 401) {
            const refreshResponse = await fetch(`${API_URL}/auth/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: localStorage.getItem('refreshToken') }),
                credentials: 'include',
            });

            if (refreshResponse.ok) {
                const { access } = await refreshResponse.json();
                // Update token in cookie
                document.cookie = `accessToken=${access}; path=/; max-age=604800`; 
                
                // Retry admin check with new token
                const retryResponse = await fetch(`${API_URL}/auth/is-admin/`, {
                    headers: {
                        'Authorization': `Bearer ${access}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    return Boolean(retryData.is_staff);
                }
            }
        }
    } catch (error) {
        console.error('Admin check error:', error);
    }

    return false;
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    // Always check admin routes first
    if (adminRoutes.some(route => pathname.startsWith(route))) {
        // If no token, redirect to login
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Check if user is admin
        const isAdminResult = await isAdmin(token); // Use Axios to check admin status
        if (!isAdminResult) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    // Check if the path is protected
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Check if trying to access auth routes while logged in
    if (authRoutes.some(route => pathname.startsWith(route))) {
        if (token) {
            return NextResponse.redirect(new URL('/profile', request.url));
        }
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        '/profile/:path*',
        '/orders/:path*',
        '/admin/:path*', // Include all admin subroutes
        '/login',
        '/register',
    ],
};
