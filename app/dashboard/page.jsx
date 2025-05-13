"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
    });
    const data = await res.json();
    alert(data.message);

    router.push("/login");
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
