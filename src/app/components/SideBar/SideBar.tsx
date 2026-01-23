"use client";

import styles from "./SideBar.module.css";
import { useRef, useEffect } from "react";
import { MagnifyingGlassIcon, HouseIcon, GearIcon, TrashIcon, PlusIcon } from "@phosphor-icons/react";
import Tab from "@/app/components/SideBarTab/SideBarTab";
import { getSidebarWidth, setSidebarWidth } from "@/utils/uiState";

interface SideBarProps {
    isOpen: boolean;
}

export default function SideBar({ isOpen }: SideBarProps) {
    const resizerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const widthRef = useRef(260);

    useEffect(() => {
        const loadSidebarWidth = async () => {
            try {
                const savedWidth = (await getSidebarWidth()) ?? 260;
                widthRef.current = savedWidth;
                if (sidebarRef.current) sidebarRef.current.style.width = `${savedWidth}px`;
            } catch (err) {
                console.error("Failed to load sidebar width:", err);
            }
        };

        void loadSidebarWidth();
    }, []);

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
                await setSidebarWidth(widthRef.current);
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
                    <div className={styles["content-group"]}>
                        <span className={styles["content-micro-label"]}>General</span>
                        <div className={styles["tab-list"]}>
                            <Tab icon={<MagnifyingGlassIcon size={16} />} label="Search"/>
                            <Tab icon={<HouseIcon size={16} />} label="Home"/>
                        </div>
                    </div>
                    <div className={styles["content-group"]}>
                        <span className={styles["content-micro-label"]}>Notes</span>
                        {/* NOTES COMPONENT TO BE ADDED HERE */}
                        {/* NOTES COMPONENT WILL LOAD NOTES */}
                        <div className={styles["tab-list"]}>
                            <Tab icon={<PlusIcon size={16}/>} label={"Add Note"}/>
                        </div>
                    </div>
                    <div className={styles["content-group"]}>
                        <div className={styles["tab-list"]}>
                            <Tab icon={<GearIcon size={16} />} label="Settings"/>
                            <Tab icon={<TrashIcon size={16} />} label="Trash"/>
                        </div>
                    </div>
                </div>
            </aside>
            <div ref={resizerRef} className={styles["sidebar-resizer-wrapper"]}>
                <div className={styles["sidebar-resizer"]} />
            </div>
        </div>
    )
}