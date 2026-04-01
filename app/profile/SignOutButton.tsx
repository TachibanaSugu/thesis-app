"use client";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 px-5 py-2 rounded-lg font-bold text-sm transition-colors"
    >
      Sign Out
    </button>
  );
}
