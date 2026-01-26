"use client";

import { XIcon, MinusIcon, SquareIcon, SidebarSimpleIcon } from "@phosphor-icons/react";
import styles from "./HeaderBar.module.css";

export default function HeaderBar({ onToggleSidebarAction }: { onToggleSidebarAction: () => void }) {
    const minimize = () => {
        window.electron.window.maximize();
    };

    const maximize = () => {
        window.electron.window.maximize();
    };

    const close = () => {
        window.electron.window.close();
    };

    return (
        <div className={styles["title-bar"]} data-custom-drag-region>

            <div className={styles["branding"]}>
                {/* APPLICATION NAME OR ICON TO BE ADDED */}
                <button
                    className={`${styles["btn"]} ${styles["sidebar"]}`}
                    onClick={onToggleSidebarAction}
                >
                    <SidebarSimpleIcon size={20} />
                </button>
            </div>

            <div className={styles["controls"]}>
                <button className={`${styles["window-btn"]} ${styles["minimize"]}`} onClick={minimize}>
                    <MinusIcon size={13} />
                </button>
                <button className={`${styles["window-btn"]} ${styles["maximize"]}`} onClick={maximize}>
                    <SquareIcon size={12} />
                </button>
                <button className={`${styles["window-btn"]} ${styles["close"]}`} onClick={close}>
                    <XIcon size={15} />
                </button>
            </div>
        </div>
    );
}
