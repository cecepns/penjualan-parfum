import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";

export default function PublicLayout() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get(API_ENDPOINTS.SETTINGS.GET).then((res) => setSettings(res.data.data));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
