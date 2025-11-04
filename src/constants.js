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
};

export const PIN_STORAGE_KEY = STORAGE_KEYS.PIN;

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
];

export const FONT_OPTIONS = [
  { name: 'Sans', value: "var(--font-sans)" },
  { name: 'Serif', value: "var(--font-serif)" },
  { name: 'Mono', value: "var(--font-mono)" },
];

export const FONT_SIZES = [
    { name: 'Small', value: '14px', icon: CaseLower },
    { name: 'Medium', value: '16px', icon: CaseUpper },
    { name: 'Large', value: '18px', icon: CaseUpper },
];

export const LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    PIN_LENGTH: 4,
};