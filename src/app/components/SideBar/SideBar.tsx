"use client";

import styles from "./SideBar.module.css";
import { useRef, useEffect } from "react";

interface SideBarProps {
    isOpen: boolean;
}

export default function SideBar({ isOpen }: SideBarProps) {
    const resizerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);

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
        };

        const onMouseUp = () => {
            isResizing = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
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