"use client";

import styles from "./SideBar.module.css";
import { useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Settings } from "@/types/Settings";

interface SideBarProps {
    isOpen: boolean;
}

export default function SideBar({ isOpen }: SideBarProps) {
    const resizerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const widthRef = useRef(260);

    // For loading saved width
    useEffect(() => {
        (async () => {
            try {
                const settings: { sidebar_width: number } = await invoke("load_settings");
                widthRef.current = settings.sidebar_width;
                if (sidebarRef.current) sidebarRef.current.style.width = `${settings.sidebar_width}px`;
            } catch (err) {
                console.error("Failed to load sidebar width:", err);
            }
        })();
    }, []);

    // For resizing
    useEffect(() => {
        const sidebar = sidebarRef.current;
        const resizer = resizerRef.current;
        if (!sidebar || !resizer) return;

        const minWidth = parseInt(getComputedStyle(sidebar).minWidth);
        const maxWidth = parseInt(getComputedStyle(sidebar).maxWidth);

        let isResizing = false;

        const onMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            let newWidth = e.clientX - sidebar.getBoundingClientRect().left;

            if (newWidth < minWidth) newWidth = minWidth;
            if (newWidth > maxWidth) newWidth = maxWidth;

            sidebar.style.width = `${newWidth}px`;
            widthRef.current = newWidth;
        };

        const onMouseUp = async () => {
            isResizing = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);

            try {
                console.log("About to load settings...");
                const settings = await invoke<Settings>("load_settings");

                const newSettings = {
                    ...settings,
                    sidebar_width: widthRef.current,
                };

                const result = await invoke("save_settings", { settings: newSettings });
                console.log("Result after saving:",result);
            } catch (err) {
                console.error("Failed to save sidebar width:", err);
            }
        };

        const onMouseDown = (e: MouseEvent) => {
            isResizing = true;
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
            e.preventDefault();
        };

        resizer.addEventListener("mousedown", onMouseDown);

        return () => {
            resizer.removeEventListener("mousedown", onMouseDown);
        };
    }, []);

    return (
        <div className={`${styles["sidebar-container"]} ${isOpen ? styles["open"] : styles["closed"]}`}>
            <aside ref={sidebarRef} className={styles["sidebar"]}>
                <div className={styles["sidebar-content"]}>

                </div>
            </aside>
            <div ref={resizerRef} className={styles["sidebar-resizer-wrapper"]}>
                <div className={styles["sidebar-resizer"]} />
            </div>
        </div>
    )
}