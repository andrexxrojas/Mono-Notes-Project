import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Note {
    id: string;
    title: string;
    icon?: string;
    created_at: number;
}


interface NotesContextType {
    notes: Note[];
    currentNoteId: string | null;
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    setCurrentNoteId: (id: string) => void;
    updateNoteTitle: (id: string, title: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

    const updateNoteTitle = (id: string, title: string) => {
        setNotes((prev) =>
            prev.map((note) => (note.id === id ? { ...note, title } : note))
        );
    };

    return (
        <NotesContext.Provider
            value={{ notes, currentNoteId, setNotes, setCurrentNoteId, updateNoteTitle }}
        >
            {children}
        </NotesContext.Provider>
    );
};

// Custom hook for convenience
export const useNotes = () => {
    const context = useContext(NotesContext);
    if (!context) throw new Error("useNotes must be used within a NotesProvider");
    return context;
};
