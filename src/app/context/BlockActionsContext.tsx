"use client";

import React, { createContext, useContext } from "react";
import { Block } from "@/app/type/electron";

interface BlockActions {
    addBlockBelow?: (block: Block) => Promise<void>;
    updateBlockContent: (blockId: string, content: any) => void
    setFocusedBlockId: (blockId: string | null) => void
    focusedBlockId: string | null;
}

const BlockActionsContext = createContext<BlockActions>({} as BlockActions);

export function useBlockActions() {
    const ctx = useContext(BlockActionsContext);
    if (!ctx) throw new Error("useBlockActions must be used within a BlockActionsProvider");
    return ctx;
}

export function BlockActionsProvider({
                                         value,
                                         children,
                                     }: {
    value: BlockActions;
    children: React.ReactNode;
}) {
    return (
        <BlockActionsContext.Provider value={value}>
            {children}
        </BlockActionsContext.Provider>
    );
}