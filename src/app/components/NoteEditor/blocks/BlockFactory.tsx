import { memo } from "react";
import { Block } from "@/app/type/electron";
import TextBlock from "@/app/components/NoteEditor/blocks/TextBlock/TextBlock";
import BlockWrapper from "@/app/components/NoteEditor/blocks/BlockWrapper/BlockWrapper";
import { useBlockActions } from "@/app/context/BlockActionsContext";

interface BlockFactoryProps {
    block: Block;
    autoFocus?: boolean;
    onMeasured?: (height: number) => void;
}

const BlockFactory = memo(({ block, autoFocus, onMeasured }: BlockFactoryProps) => {
    const { addBlockBelow, updateBlockContent } = useBlockActions();

    switch (block.blockType) {
        default:
            return (
                <BlockWrapper blockId={block.id}>
                    <TextBlock
                        block={block}
                        addBlockBelow={addBlockBelow}
                        autoFocus={autoFocus}
                        onMeasured={onMeasured}
                        updateBlockContent={updateBlockContent}
                    />
                </BlockWrapper>
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