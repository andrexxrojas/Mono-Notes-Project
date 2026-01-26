import { Block } from "@/app/type/electron";
import TextBlock from "@/app/components/NoteEditor/blocks/TextBlock/TextBlock";

interface BlockFactoryProps {
    block: Block;
    addBlockBelow?: (block: Block) => Promise<void>;
    autoFocus?: boolean;
}

export default function BlockFactory({ block, addBlockBelow, autoFocus }: BlockFactoryProps) {
    switch (block.block_type) {
        default:
            return (
                <TextBlock
                    key={block.id}
                    block={block}
                    addBlockBelow={addBlockBelow}
                    autoFocus={autoFocus}
                />
            );
    }
}