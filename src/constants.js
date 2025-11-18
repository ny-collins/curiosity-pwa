import {
    BookOpen, CheckSquare, Brain, Sun, Moon, Laptop, CaseLower, CaseUpper,
    StickyNote, BookHeart, Lightbulb, Target, Flag, HelpCircle,
    Sparkles, Briefcase, Key, Lock, CreditCard, FileText, Edit3
} from 'lucide-react';
export const ENTRY_TYPES = [
    {
        value: 'note',
        label: 'Quick Note',
        icon: StickyNote,
        emoji: '📝',
        description: 'Capture a quick thought',
        color: '#f59e0b',
        template: ''
    },
    {
        value: 'journal',
        label: 'Journal Entry',
        icon: BookHeart,
        emoji: '📔',
        description: 'Document your day',
        color: '#8b5cf6',
        template: '## 🌅 What happened today?\n\n\n## 💭 How do I feel?\n\n\n## 🙏 What am I grateful for?\n\n'
    },
    {
        value: 'idea',
        label: 'Idea',
        icon: Lightbulb,
        emoji: '💡',
        description: 'Capture a spark of inspiration',
        color: '#eab308',
        template: '## 💡 The Big Idea\n\n\n## 🤔 Why This Matters\n\n\n## 🎯 Next Steps\n\n'
    },
    {
        value: 'goal',
        label: 'Goal',
        icon: Target,
        emoji: '🎯',
        description: 'Set a new goal',
        color: '#22c55e',
        template: '## 🎯 My Goal\n\n\n## 🔥 Why This Matters\n\n\n## ✅ Success Criteria\n\n\n## 📅 Deadline\n\n'
    },
    {
        value: 'milestone',
        label: 'Milestone',
        icon: Flag,
        emoji: '🏁',
        description: 'Celebrate an achievement',
        color: '#10b981',
        template: '## 🏁 Milestone Achieved\n\n\n## 🎉 What I Accomplished\n\n\n## 📈 Impact\n\n'
    },
    {
        value: 'article',
        label: 'Study Notes',
        icon: BookOpen,
        emoji: '📚',
        description: 'Notes from reading or study',
        color: '#3b82f6',
        template: '## 📚 Source\n\n\n## 🔑 Key Points\n\n- \n- \n- \n\n## 💭 My Thoughts\n\n\n## 🔗 Related Ideas\n\n'
    },
    {
        value: 'question',
        label: 'Question',
        icon: HelpCircle,
        emoji: '❓',
        description: 'Something you\'re curious about',
        color: '#06b6d4',
        template: '## ❓ The Question\n\n\n## 🧩 Context & Background\n\n\n## 💡 Possible Answers\n\n'
    },
    {
        value: 'discovery',
        label: 'Discovery',
        icon: Sparkles,
        emoji: '✨',
        description: 'Something new you learned',
        color: '#ec4899',
        template: '## ✨ What I Discovered\n\n\n## 🚀 Why It\'s Exciting\n\n\n## 📝 How I\'ll Use This\n\n'
    },
    {
        value: 'task',
        label: 'Task List',
        icon: CheckSquare,
        emoji: '✅',
        description: 'Tasks and to-dos',
        color: '#14b8a6',
        template: '## ✅ Tasks\n\n- [ ] \n- [ ] \n- [ ] \n\n## 📌 Priority\n\n'
    },
    {
        value: 'project',
        label: 'Project',
        icon: Briefcase,
        emoji: '📁',
        description: 'Plan a project',
        color: '#6366f1',
        template: '## 📁 Project Overview\n\n\n## 🎯 Goals\n\n\n## 📋 Tasks\n\n- [ ] \n- [ ] \n\n## 📅 Timeline\n\n'
    },
    {
        value: 'vault-password',
        label: 'Password',
        icon: Key,
        emoji: '🔑',
        description: 'Store login credentials',
        color: '#ef4444',
        secure: true,
        template: null
    },
    {
        value: 'vault-note',
        label: 'Secure Note',
        icon: Lock,
        emoji: '🔒',
        description: 'Private encrypted note',
        color: '#dc2626',
        secure: true,
        template: null
    },
    {
        value: 'vault-card',
        label: 'Card/Account',
        icon: CreditCard,
        emoji: '💳',
        description: 'Credit card or account info',
        color: '#b91c1c',
        secure: true,
        template: null
    },
];
const ENTRY_TYPE_MAP = new Map(ENTRY_TYPES.map(type => [type.value, type]));
export const getEntryType = (value) => {
    return ENTRY_TYPE_MAP.get(value) || ENTRY_TYPES[0];
};
export const REGULAR_ENTRY_TYPES = ENTRY_TYPES.filter(t => !t.secure);
export const VAULT_ITEM_TYPES = ENTRY_TYPES.filter(t => t.secure);
export const STORAGE_KEYS = {
    THEME_MODE: 'curiosity-theme-mode',
    THEME_COLOR: 'curiosity-theme-color',
    THEME_FONT: 'curiosity-theme-font',
    FONT_SIZE: 'curiosity-font-size',
    PIN: 'curiosity-app-pin',
    WEBAUTHN_CREDENTIAL_ID: 'curiosity-webauthn-credential-id',
};
export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  }
};
export const TRANSITIONS = {
  fast: { duration: 0.15 },
  normal: { duration: 0.2 },
  slow: { duration: 0.3 },
  spring: { type: "spring", stiffness: 300, damping: 30 }
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
