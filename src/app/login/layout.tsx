"use client";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div>
                {children}
            </div>
        </AuthProvider>
    );
}