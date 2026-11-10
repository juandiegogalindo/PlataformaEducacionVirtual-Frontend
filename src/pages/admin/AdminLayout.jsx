import { Outlet } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
  return <div className="admin-module"><Outlet /></div>;
}
