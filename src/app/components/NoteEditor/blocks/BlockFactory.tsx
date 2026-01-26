import { memo } from "react";
import { Block } from "@/app/type/electron";
import TextBlock from "@/app/components/NoteEditor/blocks/TextBlock/TextBlock";

interface BlockFactoryProps {
    block: Block;
    addBlockBelow?: (block: Block) => Promise<void>;
    autoFocus?: boolean;
    onMeasured?: (height: number) => void;
}

const BlockFactory = memo(({ block, addBlockBelow, autoFocus, onMeasured }: BlockFactoryProps) => {
    switch (block.block_type) {
        default:
            return (
                <TextBlock
                    block={block}
                    addBlockBelow={addBlockBelow}
                    autoFocus={autoFocus}
                    onMeasured={onMeasured}
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