import { BookText, Notebook, Shield, Target, Type } from 'lucide-react';

export const ENTRY_TYPES = [
    { value: 'note', label: 'Note', icon: Type },
    { value: 'journal', label: 'Journal', icon: BookText },
    { value: 'goal', label: 'Goal', icon: Target },
    { value: 'log', label: 'Log', icon: Notebook },
    { value: 'credential', label: 'Credential', icon: Shield },
];

export const getEntryType = (value) => {
    return ENTRY_TYPES.find(t => t.value === value) || ENTRY_TYPES[0];
};
