import styles from "./SideBarTab.module.css";
import {MouseEventHandler, ReactNode} from "react";

type SideBarTabProps = {
    icon: ReactNode;
    label: string;
    onClick?: MouseEventHandler<HTMLButtonElement>
}

export default function SideBarTab({ icon, label, onClick }: SideBarTabProps) {
    return (
        <button className={styles["content-tab"]}>
            {icon}
            <span className={styles["content-tab-txt"]}>{label}</span>
        </button>
    )
}