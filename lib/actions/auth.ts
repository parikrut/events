"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function registerHost(data: {
    name: string;
    email: string;
    password: string;
}) {
    try {
        // Check if host already exists
        const existingHost = await prisma.host.findUnique({
            where: { email: data.email },
        });

        if (existingHost) {
            return {
                success: false,
                message: "An account with this email already exists",
            };
        }

        // Hash password
        const passwordHash = await hashPassword(data.password);

        // Create host
        const host = await prisma.host.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
            },
        });

        // Create session
        await createSession(host.id, host.email);

        return {
            success: true,
            message: "Account created successfully",
        };
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            message: "Failed to create account. Please try again.",
        };
    }
}

export async function loginHost(data: { email: string; password: string }) {
    try {
        // Find host by email
        const host = await prisma.host.findUnique({
            where: { email: data.email },
        });

        if (!host) {
            return {
                success: false,
                message: "Invalid email or password",
            };
        }

        // Verify password
        const isPasswordValid = await verifyPassword(data.password, host.passwordHash);

        if (!isPasswordValid) {
            return {
                success: false,
                message: "Invalid email or password",
            };
        }

        // Create session
        await createSession(host.id, host.email);

        return {
            success: true,
            message: "Logged in successfully",
        };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            message: "Failed to log in. Please try again.",
        };
    }
}

export async function logoutHost() {
    await deleteSession();
    redirect("/auth/login");
}

export async function getCurrentHost() {
    const session = await getSession();

    if (!session) {
        return null;
    }

    try {
        const host = await prisma.host.findUnique({
            where: { id: session.hostId },
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                createdAt: true,
            },
        });

        return host;
    } catch (error) {
        console.error("Error fetching current host:", error);
        return null;
    }
}

export async function updateHostProfile(data: {
    name?: string;
    email?: string;
}) {
    const session = await getSession();

    if (!session) {
        return {
            success: false,
            message: "Not authenticated",
        };
    }

    try {
        // If email is being updated, check if it's already taken
        if (data.email && data.email !== session.email) {
            const existing = await prisma.host.findUnique({
                where: { email: data.email },
            });

            if (existing) {
                return {
                    success: false,
                    message: "Email already in use",
                };
            }
        }

        const host = await prisma.host.update({
            where: { id: session.hostId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
            },
        });

        // If email changed, update session
        if (data.email) {
            await createSession(host.id, host.email);
        }

        return {
            success: true,
            message: "Profile updated successfully",
        };
    } catch (error) {
        console.error("Profile update error:", error);
        return {
            success: false,
            message: "Failed to update profile",
        };
    }
}

export async function changePassword(data: {
    currentPassword: string;
    newPassword: string;
}) {
    const session = await getSession();

    if (!session) {
        return {
            success: false,
            message: "Not authenticated",
        };
    }

    try {
        const host = await prisma.host.findUnique({
            where: { id: session.hostId },
        });

        if (!host) {
            return {
                success: false,
                message: "Host not found",
            };
        }

        // Verify current password
        const isPasswordValid = await verifyPassword(
            data.currentPassword,
            host.passwordHash
        );

        if (!isPasswordValid) {
            return {
                success: false,
                message: "Current password is incorrect",
            };
        }

        // Hash new password
        const newPasswordHash = await hashPassword(data.newPassword);

        // Update password
        await prisma.host.update({
            where: { id: session.hostId },
            data: { passwordHash: newPasswordHash },
        });

        return {
            success: true,
            message: "Password changed successfully",
        };
    } catch (error) {
        console.error("Password change error:", error);
        return {
            success: false,
            message: "Failed to change password",
        };
    }
}
