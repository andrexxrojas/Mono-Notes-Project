"use client";

import React, { useState } from "react";
import HeaderBar from "@/app/components/HeaderBar/HeaderBar";
import SideBar from "@/app/components/SideBar/SideBar";
import styles from "../../layout.module.css";

export default function SideBarWrapper({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => { setSidebarOpen((prev) => !prev); }

    return (
        <>
            <HeaderBar onToggleSidebarAction={toggleSidebar} />
            <div className={styles["app-shell"]}>
                <SideBar isOpen={sidebarOpen} />
                <main className={styles["main-container"]}>{children}</main>
            </div>
        </>
    )
}