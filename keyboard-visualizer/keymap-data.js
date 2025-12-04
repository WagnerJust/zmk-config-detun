// Keymap data from the ZMK configuration
export const keymap = [
    // Row 1 (top)
    ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'BSPC'],
    // Row 2
    ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '\\'],
    // Row 3
    ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
    // Row 4
    ['SHFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHFT'],
    // Row 5 (bottom)
    ['CTRL', 'GUI', 'ALT', '-', '=', 'SPC', 'ENT', '[', ']', 'ALT', 'GUI', 'CTRL']
];

// Key color mapping
export const keyColors = {
    letters: 0x4CAF50,    // Green
    numbers: 0x2196F3,    // Blue
    modifiers: 0xFF9800,  // Orange
    navigation: 0xF44336, // Red
    special: 0x9C27B0     // Purple
};

// Key type classification
export const keyTypes = {
    letters: 'QWERTYUIOPASDFGHJKLZXCVBNM',
    numbers: '1234567890',
    modifiers: ['CTRL', 'GUI', 'ALT', 'SHFT', 'TAB', 'CAPS', 'ESC'],
    navigation: ['BSPC', 'ENT', 'SPC']
};

// Key combinations data
export const keyCombinations = {
    'CTRL': [
        { key: 'C', description: 'Copy selected text' },
        { key: 'V', description: 'Paste clipboard content' },
        { key: 'X', description: 'Cut selected text' },
        { key: 'Z', description: 'Undo last action' },
        { key: 'Y', description: 'Redo last undone action' },
        { key: 'A', description: 'Select all' },
        { key: 'F', description: 'Find in page' },
        { key: 'S', description: 'Save file' },
        { key: 'W', description: 'Close tab/window' },
        { key: 'T', description: 'New tab' },
        { key: 'N', description: 'New window' },
        { key: 'P', description: 'Print' },
        { key: 'R', description: 'Refresh page' },
        { key: 'Q', description: 'Quit application' },
        { key: 'O', description: 'Open file' },
        { key: 'L', description: 'Focus address bar' },
        { key: '[', description: 'Decrease font size' },
        { key: ']', description: 'Increase font size' },
        { key: '/', description: 'Toggle comment' }
    ],
    'SHFT': [
        { key: 'Q-Z', description: 'Capital letters' },
        { key: '1', description: '! (exclamation)' },
        { key: '2', description: '@ (at sign)' },
        { key: '3', description: '# (hash)' },
        { key: '4', description: '$ (dollar)' },
        { key: '5', description: '% (percent)' },
        { key: '6', description: '^ (caret)' },
        { key: '7', description: '& (ampersand)' },
        { key: '8', description: '* (asterisk)' },
        { key: '9', description: '( (left paren)' },
        { key: '0', description: ') (right paren)' },
        { key: '-', description: '_ (underscore)' },
        { key: '=', description: '+ (plus)' },
        { key: '[', description: '{ (left brace)' },
        { key: ']', description: '} (right brace)' },
        { key: '\\', description: '| (pipe)' },
        { key: ';', description: ': (colon)' },
        { key: "'", description: '" (double quote)' },
        { key: ',', description: '< (less than)' },
        { key: '.', description: '> (greater than)' },
        { key: '/', description: '? (question mark)' }
    ],
    'GUI': [
        { key: 'TAB', description: 'Switch applications' },
        { key: 'SPC', description: 'Spotlight search (macOS) / App launcher' },
        { key: 'L', description: 'Lock screen' },
        { key: 'D', description: 'Show desktop' },
        { key: 'E', description: 'File explorer' },
        { key: 'R', description: 'Run command' },
        { key: '1-9', description: 'Switch to workspace/desktop' },
        { key: '←', description: 'Snap window left' },
        { key: '→', description: 'Snap window right' },
        { key: '↑', description: 'Maximize window' },
        { key: '↓', description: 'Minimize window' },
        { key: 'Q', description: 'Quick settings' },
        { key: 'A', description: 'Action center' },
        { key: 'I', description: 'Settings' }
    ],
    'ALT': [
        { key: 'TAB', description: 'Switch between windows' },
        { key: 'F4', description: 'Close current window' },
        { key: '←', description: 'Navigate back' },
        { key: '→', description: 'Navigate forward' },
        { key: 'ESC', description: 'Cancel/Close dialog' },
        { key: 'ENT', description: 'Open properties' },
        { key: 'SPC', description: 'Open window menu' },
        { key: 'F', description: 'Open File menu' },
        { key: 'E', description: 'Open Edit menu' },
        { key: 'V', description: 'Open View menu' },
        { key: 'H', description: 'Open Help menu' }
    ]
};
