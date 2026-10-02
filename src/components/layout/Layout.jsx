import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Breadcrumb from "./Breadcrumb";

export default function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <Breadcrumb />
        <Outlet />
      </main>
    </div>
  );
}