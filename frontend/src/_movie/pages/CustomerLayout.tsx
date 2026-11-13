import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function CustomerLayout() {
    return (
        <div className="customer-root">
            <Navbar />
            <main className="customer-main">
                <Outlet />
            </main>
        </div>
    );
}