"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { data: session, status } = useSession();
  return (
    <div className="w-full bg-white flex items-center justify-between px-6 py-4 relative shadow">
      <div>
        <p className="font-semibold">{session?.user?.name}</p>
        <p className={status === "authenticated" ? "text-green-500" : "text-red-500"}>
          {status === "authenticated" ? "online" : "offline"}
        </p>
      </div>
      <div className="absolute top-4 right-4">
        <button
          onClick={async () => signOut({ callbackUrl: "/login" })}
          className="bg-emerald-400 hover:bg-indigo-500 text-white p-2 rounded transition-colors duration-200"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
