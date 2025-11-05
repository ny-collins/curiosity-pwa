import { BookOpen, CheckSquare, Brain, Sun, Moon, Laptop, CaseLower, CaseUpper } from 'lucide-react';

export const ENTRY_TYPES = [
    { value: 'note', label: 'Note', icon: BookOpen, template: '' },
    { value: 'journal', label: 'Journal Entry', icon: BookOpen, template: '## What happened today?\n\n\n## How do I feel?\n\n\n## What am I grateful for?\n\n' },
    { value: 'task', label: 'Task List', icon: CheckSquare, template: '## To-Do\n\n- [ ] \n- [ ] \n- [ ] \n' },
    { value: 'idea', label: 'Idea', icon: Brain, template: '## The Big Idea\n\n' },
];

const ENTRY_TYPE_MAP = new Map(ENTRY_TYPES.map(type => [type.value, type]));

export const getEntryType = (value) => {
    return ENTRY_TYPE_MAP.get(value) || ENTRY_TYPES[0];
};

export const STORAGE_KEYS = {
  THEME_MODE: 'curiosity-theme-mode',
  THEME_COLOR: 'curiosity-theme-color',
  THEME_FONT: 'curiosity-theme-font',
  FONT_SIZE: 'curiosity-font-size',
  PIN: 'curiosity-pin',
  WEBAUTHN_CREDENTIAL_ID: 'curiosity-webauthn-id'
};

export const PIN_STORAGE_KEY = STORAGE_KEYS.PIN;
export const WEBAUTHN_CREDENTIAL_ID_KEY = STORAGE_KEYS.WEBAUTHN_CREDENTIAL_ID;

export const THEME_MODES = [
  { name: 'Light', value: 'light', icon: Sun },
  { name: 'Dark', value: 'dark', icon: Moon },
  { name: 'System', value: 'system', icon: Laptop },
];

export const THEME_COLORS = [
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Slate', hex: '#64748b' },
  { name: 'Red', hex: '#ef4444' },
];

export const FONT_CATEGORIES = [
    {
        name: 'Sans Serif',
        fonts: [
          { name: 'Inter', value: "var(--font-sans)", import: "Inter:wght@400;500;600;700" },
          { name: 'Roboto', value: "'Roboto', sans-serif", import: "Roboto:ital,wght@0,400;0,700;1,400" },
          { name: 'Lato', value: "'Lato', sans-serif", import: "Lato:ital,wght@0,400;0,700;1,400" },
        ]
    },
    {
        name: 'Serif',
        fonts: [
          { name: 'Lora', value: "var(--font-serif)", import: "Lora:ital,wght@0,400;0,700;1,400" },
          { name: 'Merriweather', value: "'Merriweather', serif", import: "Merriweather:ital,wght@0,400;0,700;1,400" },
          { name: 'Playfair Display', value: "'Playfair Display', serif", import: "Playfair+Display:ital,wght@0,400;0,700;1,400" },
        ]
    },
    {
        name: 'Mono',
        fonts: [
            { name: 'JetBrains Mono', value: "var(--font-mono)", import: "JetBrains+Mono:wght@400;700" },
            { name: 'Source Code Pro', value: "'Source Code Pro', monospace", import: "Source+Code+Pro:ital,wght@0,400;0,700;1,400" },
        ]
    },
    {
        name: 'Stylistic',
        fonts: [
            { name: 'Pacifico', value: "'Pacifico', cursive", import: "Pacifico" },
            { name: 'Caveat', value: "'Caveat', cursive", import: "Caveat:wght@400;700" },
        ]
    }
];

export const FONT_OPTIONS = FONT_CATEGORIES.flatMap(c => c.fonts);

export const FONT_SIZES = [
    { name: 'Small', value: '14px', icon: CaseLower },
    { name: 'Medium', value: '16px', icon: CaseUpper },
    { name: 'Large', value: '18px', icon: CaseUpper },
];

export const LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    PIN_LENGTH: 4,
};