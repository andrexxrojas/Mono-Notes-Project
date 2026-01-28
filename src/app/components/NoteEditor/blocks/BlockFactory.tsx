import { memo } from "react";
import { Block } from "@/app/type/electron";
import TextBlock from "@/app/components/NoteEditor/blocks/TextBlock/TextBlock";

interface BlockFactoryProps {
    block: Block;
    addBlockBelow?: (block: Block) => Promise<void>;
    autoFocus?: boolean;
    onMeasured?: (height: number) => void;
    updateBlockContent: (blockId: string, content: any) => void
}

const BlockFactory = memo(({ block, addBlockBelow, autoFocus, onMeasured, updateBlockContent }: BlockFactoryProps) => {
    switch (block.blockType) {
        default:
            return (
                <TextBlock
                    block={block}
                    addBlockBelow={addBlockBelow}
                    autoFocus={autoFocus}
                    onMeasured={onMeasured}
                    updateBlockContent={updateBlockContent}
                />
            );
    }
}, (prevProps, nextProps) => {
    return (
        prevProps.block.id === nextProps.block.id &&
        prevProps.block.content === nextProps.block.content &&
        prevProps.autoFocus === nextProps.autoFocus
    );
});

BlockFactory.displayName = "BlockFactory";
export default BlockFactory;