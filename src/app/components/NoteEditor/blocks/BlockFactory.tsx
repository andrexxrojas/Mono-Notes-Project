import { Block } from "@/app/type/electron";
import TextBlock from "@/app/components/NoteEditor/blocks/TextBlock/TextBlock";

export default function BlockFactory({ block }: { block: Block }) {
    switch (block.block_type) {
        default:
            return <TextBlock key={block.id} block={block} />;
    }
}