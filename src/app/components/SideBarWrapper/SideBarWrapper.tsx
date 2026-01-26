"use client";

import React, { useState, useEffect } from "react";
import HeaderBar from "@/app/components/HeaderBar/HeaderBar";
import styles from "../../layout.module.css";
import { NotesProvider } from "@/app/context/NotesContext";
import SideBar from "@/app/components/SideBar/SideBar";

export default function SideBarWrapper({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const toggleSidebar = async () => {
        setSidebarOpen((prev) => {
            const newState = !prev;
            window.electron.ui.patch({ sidebarOpen: newState });
            return newState;
        });
    }

    useEffect(() => {
        const loadSidebarState = async () => {
            const state = await window.electron.ui.get();
            if (typeof state.sidebarOpen === "boolean") {
                setSidebarOpen(state.sidebarOpen);
            }
            setLoaded(true);
        }

        void loadSidebarState();
    }, []);

    if (!loaded) {
        return null;
    }

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