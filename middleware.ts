import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not defined");
}

interface JWTPayload {
    userId: string;
    role: string;
    [key: string]: any;
}

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    // Block direct access to /login and /signup routes (redirect to root)
    if (pathname === "/login" || pathname.startsWith("/login/") || pathname === "/signup" || pathname.startsWith("/signup/")) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Check if accessing root or app pages
    const isAuthPage = pathname === "/" || pathname === "/app";

    // If user is trying to access the root/app page
    if (isAuthPage) {
        // If they have a valid token, redirect them based on their role
        if (token) {
            try {
                const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET)) as { payload: JWTPayload };
                console.log("TOKEN PAYLOAD:", payload);

                // Redirect based on user role
                switch (payload.role) {
                    case "employee":
                    case "employee1":
                        return NextResponse.redirect(new URL("/hr1/employee/job-postings", req.url));
                    case "employee2":
                        return NextResponse.redirect(new URL("/hr2/employee/dashboard", req.url));
                    case "employee3":
                        return NextResponse.redirect(new URL("/hr3/employee/job-postings", req.url));
                    case "hr1admin":
                        return NextResponse.redirect(new URL("/hr1/admin", req.url));
                    case "hr2admin":
                        return NextResponse.redirect(new URL("/hr2/admin", req.url));
                    case "hr3admin":
                        return NextResponse.redirect(new URL("/hr3/admin", req.url));
                    default:
                        return NextResponse.redirect(new URL("/hr1/employee/dashboard", req.url));
                }
            } catch (error) {
                console.error("Invalid or expired token:", error);
                const response = NextResponse.next();
                response.cookies.delete("token");
                return response;
            }
        }
        // No token, allow access to root/app page
        return NextResponse.next();
    }

    // For protected routes, require valid token
    if (!token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET)) as { payload: JWTPayload };
        const role = payload.role;

        // Role-based access control
        // Role-based access control
        const url = req.nextUrl;

        switch (role) {

            // HR1
            case "hr1admin":
                if (!pathname.startsWith("/hr1/admin")) {
                    return NextResponse.redirect(new URL("/hr1/admin", req.url));
                }
                break;

            case "employee":
            case "employee1":
                if (!pathname.startsWith("/hr1/employee")) {
                    return NextResponse.redirect(new URL("/hr1/employee/job-postings", req.url));
                }
                break;

            // HR2
            case "hr2admin":
                if (!pathname.startsWith("/hr2/admin")) {
                    return NextResponse.redirect(new URL("/hr2/admin", req.url));
                }
                break;

            case "employee2":
                if (!pathname.startsWith("/hr2/employee")) {
                    return NextResponse.redirect(new URL("/hr2/employee/dashboard", req.url));
                }
                break;

            // HR3
            case "hr3admin":
                if (!pathname.startsWith("/hr3/admin")) {
                    return NextResponse.redirect(new URL("/hr3/admin", req.url));
                }
                break;

            case "employee3":
                if (!pathname.startsWith("/hr3/employee")) {
                    return NextResponse.redirect(new URL("/app/HR3/src", req.url));
                }
                break;

            default:
                console.log("Unknown user role:", role);
                return NextResponse.redirect(new URL("/", req.url));
        }

    } catch (error) {
        console.error("Invalid or expired token:", error);
        const response = NextResponse.redirect(new URL("/", req.url));
        response.cookies.delete("token");
        return response;
    }
}

export const config = {
    matcher: [
        '/',
        '/app',
        '/login/:path*',
        '/signup/:path*',
        '/hr1',
        '/hr1/login/:path*',
        '/hr1/employee/:path*',
        '/hr1/employee/my-application/:path*',
        '/hr1/employee/job-postings/:path*',
        '/hr1/employee/dashboard/:path*',
        '/hr1/admin/:path*',
        '/hr1/dashboard/:path*',
        '/hr1/profile',
        '/hr2',
        '/hr2/login/:path*',
        '/hr2/employee/:path*',
        '/hr2/employee/my-application/:path*',
        '/hr2/employee/job-postings/:path*',
        '/hr2/employee/dashboard/:path*',
        '/hr2/admin/:path*',
        '/hr2/dashboard/:path*',
        '/hr2/profile',
        '/hr3',
        '/hr3/login/:path*',
        '/hr3/employee/:path*',
        '/hr3/employee/my-application/:path*',
        '/hr3/employee/job-postings/:path*',
        '/hr3/employee/dashboard/:path*',
        '/hr3/admin/:path*',
        '/hr3/dashboard/:path*',
        '/hr3/profile',
    ],
};
