import styles from "./BlockWrapper.module.css";
import React, { ReactNode } from "react";
import { DotsSixVerticalIcon } from "@phosphor-icons/react";

interface BlockWrapperProps {
    children: ReactNode
}

export default function BlockWrapper({ children }: BlockWrapperProps) {
  return (
    <div className={styles["block-wrapper"]}>
      <div className={styles["extra-hover-zone"]} />
      <DotsSixVerticalIcon size={21} className={styles["drag-icon"]}/>
      {children}
    </div>
  );
}
