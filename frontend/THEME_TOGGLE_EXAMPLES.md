// Example usage of ThemeToggleButton component

import { ThemeToggleButton } from './components/atoms/ThemeToggleButton';

// ===================================
// VARIANT 1: Icon Button (Navbar & Landing Page)
// ===================================

// Circular button with just the icon
<ThemeToggleButton variant="icon" />

/* Visual appearance:
 * Light Mode: [  ☀️  ] - Yellow sun icon on white background
 * Dark Mode:  [  🌙  ] - Teal moon icon on dark gray background
 * 
 * Hover Effect: Scales to 1.1x with teal glow shadow
 * Click Effect: 360° rotation animation with scale transition
 */

// ===================================
// VARIANT 2: Switch Toggle (Settings Page)
// ===================================

// Switch slider with icon inside
<ThemeToggleButton variant="switch" showLabel={true} />

/* Visual appearance:
 * Light Mode: [☀️ -------- ]  Light
 *             Gray background, sun icon on left
 * 
 * Dark Mode:  [ -------- 🌙]  Dark
 *             Teal background, moon icon on right
 * 
 * Animation: Spring physics slide (500 stiffness, 30 damping)
 * Icon rotates 360° during transition
 */

// ===================================
// INTEGRATION EXAMPLES
// ===================================

// 1. In Navbar (Top navigation bar)
export const Navbar = () => {
  return (
    <nav>
      <div className="flex items-center gap-4">
        <ThemeToggleButton variant="icon" />  {/* ← Theme toggle here */}
        <a href="https://github.com">GitHub</a>
        <UserMenu />
      </div>
    </nav>
  );
};

// 2. In Landing Page (Floating top-right)
export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggleButton variant="icon" />  {/* ← Floating toggle */}
      </div>
      {/* ... rest of landing page */}
    </div>
  );
};

// 3. In Settings Page (Appearance section)
export const SettingsPage = () => {
  return (
    <div className="appearance-section">
      <h2>Appearance</h2>
      <div className="flex justify-between">
        <div>
          <p>Theme Mode</p>
          <p>Current: Dark Mode 🌙</p>
        </div>
        <ThemeToggleButton variant="switch" showLabel={true} />  {/* ← Switch toggle */}
      </div>
    </div>
  );
};

// ===================================
// THEME CONTEXT USAGE
// ===================================

import { useTheme } from './context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  // Current theme: 'light' or 'dark'
  console.log(theme);
  
  // Toggle programmatically
  toggleTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

// ===================================
// CSS VARIABLES AVAILABLE
// ===================================

/* All components can use these CSS variables for theme-aware styling: */

.my-component {
  background-color: var(--color-bg);           /* Page background */
  color: var(--color-text);                    /* Primary text */
  border-color: var(--color-border);           /* Borders */
}

.my-card {
  background-color: var(--color-card);         /* Card backgrounds */
  color: var(--color-text-secondary);          /* Secondary text */
}

.my-button {
  background-color: var(--color-accent);       /* Teal accent */
  box-shadow: 0 0 0 3px var(--color-accent-light);  /* Focus ring */
}

.my-button:hover {
  background-color: var(--color-accent-hover); /* Darker teal */
  background-color: var(--color-hover);        /* Hover backgrounds */
}

// ===================================
// ANIMATION TIMELINE
// ===================================

/*
USER CLICKS TOGGLE BUTTON
    ↓
[Step 1] Icon starts rotating (0° → 360°)
[Step 2] Icon scales down (1.0 → 0.8)
[Step 3] Icon opacity decreases (1 → 0)
    ↓ (200ms)
[Step 4] Theme state updates in Context
[Step 5] localStorage saves new theme
[Step 6] <html> class changes (light ↔ dark)
    ↓ (instant)
[Step 7] All CSS variables update
[Step 8] All components re-render with new colors
    ↓ (100ms)
[Step 9] New icon appears (opacity 0 → 1)
[Step 10] New icon rotates in (360° → 0°)
[Step 11] New icon scales up (0.8 → 1.0)
    ↓
COMPLETE! (Total: ~400ms)
*/

// ===================================
// BROWSER BEHAVIOR
// ===================================

/* First Visit (No saved preference):
 * 1. Check localStorage for 'vora-theme'
 * 2. Not found → Check OS preference
 * 3. Use OS dark mode setting
 * 4. User can override by clicking toggle
 */

/* Subsequent Visits:
 * 1. Check localStorage for 'vora-theme'
 * 2. Found → Use saved preference
 * 3. Ignore OS preference
 * 4. No flash of wrong theme!
 */

/* OS Theme Changes:
 * 1. Browser detects OS theme change
 * 2. If no saved preference → Update to match OS
 * 3. If saved preference exists → Keep saved preference
 */

export default ThemeToggleButton;
