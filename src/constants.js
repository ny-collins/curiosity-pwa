import { 
    BookText, Notebook, Shield, Target, Type, 
    Sun, Moon, Laptop 
} from 'lucide-react';

// --- TEMPLATES ---
export const ENTRY_TYPES = [
    { 
        value: 'note', 
        label: 'Note', 
        icon: Type, 
        template: '' 
    },
    { 
        value: 'journal', 
        label: 'Journal', 
        icon: BookText, 
        template: `## What's on my mind?\n\n\n## How am I feeling?\n\n\n## What am I grateful for today?\n1. \n2. \n3. \n` 
    },
    { 
        value: 'goal', 
        label: 'Goal', 
        icon: Target, 
        template: `## My Goal:\n\n\n## Why is this important?\n\n\n## Key Milestones:\n1. \n2. \n3. \n\n## Potential Obstacles:\n\n\n` 
    },
    { 
        value: 'log', 
        label: 'Log', 
        icon: Notebook, 
        template: `## Today's Log:\n\n* \n\n` 
    },
    { 
        value: 'credential', 
        label: 'Credential', 
        icon: Shield, 
        template: `**Website/Service:** \n**Username:** \n**Email:** \n**Password:** \n\n**Notes:** \n` 
    },
];

export const getEntryType = (value) => {
    return ENTRY_TYPES.find(t => t.value === value) || ENTRY_TYPES[0];
};

// --- THEME OPTIONS ---
export const THEME_COLORS = [
    { name: 'Teal', hex: '#14b8a6' }, { name: 'Rose', hex: '#f43f5e' },
    { name: 'Pink', hex: '#ec4899' }, { name: 'Fuchsia', hex: '#d946ef' },
    { name: 'Purple', hex: '#8b5cf6' }, { name: 'Violet', hex: '#6366f1' },
    { name: 'Blue', hex: '#3b82f6' }, { name: 'Sky', hex: '#0ea5e9' },
    { name: 'Cyan', hex: '#06b6d4' }, { name: 'Emerald', hex: '#10b981' },
    { name: 'Amber', hex: '#f59e0b' }, { name: 'Slate', hex: '#64748b' },
];

export const FONT_OPTIONS = [
    { name: 'Default', value: "'Inter', sans-serif" },
    { name: 'Serif', value: "'Lora', serif" },
    { name: 'Mono', value: "'JetBrains Mono', monospace" },
];

export const THEME_MODES = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Laptop },
];

// --- NEW FONT SIZES ---
export const FONT_SIZES = [
    { name: 'Small', value: '14px' },
    { name: 'Medium', value: '16px' },
    { name: 'Large', value: '18px' },
];
