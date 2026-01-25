"use client";

import React, { useState, useEffect } from "react";
import HeaderBar from "@/app/components/HeaderBar/HeaderBar";
import SideBar from "@/app/components/SideBar/SideBar";
import styles from "../../layout.module.css";
import { setSidebarOpen as savedSidebarOpen, getUIState } from "@/utils/uiState";
import { NotesProvider } from "@/app/context/NotesContext";

export default function SideBarWrapper({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = async () => {
        setSidebarOpen((prev) => {
            const newState = !prev;
            void savedSidebarOpen(newState);
            return newState;
        });
    }

    useEffect(() => {
        async function loadSidebarState() {
            const saved = await getUIState().then(res => res.sidebar_open);
            if (typeof saved === "boolean") setSidebarOpen(saved);
        }

        void loadSidebarState();
    }, []);

    return (
        <>
            <HeaderBar onToggleSidebarAction={toggleSidebar} />
            <div className={styles["app-shell"]}>
                <NotesProvider>
                    <SideBar isOpen={sidebarOpen} />
                    <main className={styles["main-container"]}>{children}</main>
                </NotesProvider>
            </div>
        </>
    )
}