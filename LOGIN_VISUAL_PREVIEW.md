# Login Page Visual Preview

## Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Floating Card Container (max-w-6xl, rounded-2xl, shadow)          │
│                                                                      │
│  ┌──────────────────────┬──────────────────────────────────────┐  │
│  │   LEFT PANEL (40%)   │   RIGHT PANEL (60%)                  │  │
│  │   ─────────────────  │   ───────────────────────────────    │  │
│  │                       │                                       │  │
│  │  [Icon] AI Tutor      │   Gradient Background                │  │
│  │         ─────────     │   (Indigo → Violet → Purple)         │  │
│  │                       │                                       │  │
│  │  Sign in to AI Tutor  │   [Particles Animation]              │  │
│  │  Your syllabus-ground │                                       │  │
│  │  ed study companion   │   [Graduation Cap Icon]              │  │
│  │                       │   AI Tutor                            │  │
│  │  ┌──────────────────┐ │   Your Syllabus-Grounded Study      │  │
│  │  │ Student │Faculty │ │   Companion                          │  │
│  │  │         │  Admin │ │                                       │  │
│  │  └──────────────────┘ │                                       │  │
│  │   ︿ Pill-shaped tabs  │   [Floating decorative shapes]       │  │
│  │                       │                                       │  │
│  │  ┌──────────────────┐ │                                       │  │
│  │  │ [G] Continue with│ │         [Student Illustration]       │  │
│  │  │      Google      │ │         ─────────────────────        │  │
│  │  └──────────────────┘ │    (3D student with backpack,        │  │
│  │                       │     books, or tablet)                 │  │
│  │  ────── Or ─────     │                                       │  │
│  │                       │                                       │  │
│  │  ┌──────────────────┐ │                                       │  │
│  │  │[👤] Email address│ │                                       │  │
│  │  └──────────────────┘ │                                       │  │
│  │                       │                                       │  │
│  │  ┌──────────────────┐ │   CSPIT CSE · RAG-Powered           │  │
│  │  │[🔒] Password  [👁]│ │   Learning Platform                  │  │
│  │  └──────────────────┘ │                                       │  │
│  │                       │                                       │  │
│  │  ☐ Remember me        │                                       │  │
│  │         Forgot pwd? →  │                                       │  │
│  │                       │                                       │  │
│  │  ┌──────────────────┐ │                                       │  │
│  │  │      Login       │ │                                       │  │
│  │  │  [Gradient Btn]  │ │                                       │  │
│  │  └──────────────────┘ │                                       │  │
│  │                       │                                       │  │
│  │  Demo credentials     │                                       │  │
│  │  pre-filled…          │                                       │  │
│  │                       │                                       │  │
│  └──────────────────────┴──────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                    [Theme Toggle - Top Right Corner]
```

## Mobile Layout (<1024px)

```
┌─────────────────────────────┐
│                             │
│   [Icon] AI Tutor           │
│          ─────────          │
│                             │
│   Sign in to AI Tutor       │
│   Your syllabus-grounded    │
│   study companion           │
│                             │
│   ┌────────────────────┐    │
│   │ Student │ Faculty │    │
│   │         │  Admin  │    │
│   └────────────────────┘    │
│    ︿ Pill-shaped tabs       │
│                             │
│   ┌────────────────────┐    │
│   │ [G] Continue with  │    │
│   │      Google        │    │
│   └────────────────────┘    │
│                             │
│   ────── Or ─────          │
│                             │
│   ┌────────────────────┐    │
│   │[👤] Email address  │    │
│   └────────────────────┘    │
│                             │
│   ┌────────────────────┐    │
│   │[🔒] Password   [👁]│    │
│   └────────────────────┘    │
│                             │
│   ☐ Remember me             │
│          Forgot pwd? →      │
│                             │
│   ┌────────────────────┐    │
│   │       Login        │    │
│   │   [Gradient Btn]   │    │
│   └────────────────────┘    │
│                             │
│   Demo credentials          │
│   pre-filled…               │
│                             │
└─────────────────────────────┘
```

## Color Scheme

### Dark Mode
- **Background**: `#0d0d14` (very dark blue-gray)
- **Left Panel**: `#17171f` (dark surface)
- **Right Panel Gradient**: `#1e1b3c → #2a1a4f → #4a1d7f → #5b21b6 → #6d28d9`
  (deep indigo → dark purple → violet → bright violet → purple)
- **Accent Violet**: `#8b5cf6`
- **Accent Gold**: `#f5c451`
- **Text**: White/light gray
- **Decorative shapes**: Violet and gold with low opacity

### Light Mode
- **Background**: `#f7f7fb` (very light purple-gray)
- **Left Panel**: `#ffffff` (white)
- **Right Panel Gradient**: `#f3e8ff → #e9d5ff → #d8b4fe → #c084fc → #a855f7`
  (very light purple → light lavender → medium lavender → purple → violet)
- **Accent Violet**: `#7c3aed`
- **Accent Gold**: `#d97706`
- **Text**: Dark gray
- **Decorative shapes**: Purple and gold with low opacity

## UI Elements Details

### Logo Lockup
```
┌──────────────────────────┐
│  ┌────┐                  │
│  │ 🎓 │  AI Tutor         │
│  └────┘    ─────────      │
│     ↑       ↑    ↑        │
│   Icon     AI  Tutor      │
│  (violet) (white)(violet) │
└──────────────────────────┘
```

### Role Tabs (Pill-shaped Segmented Control)
```
┌──────────────────────────────────────┐
│  ┌──────────┬──────────┬──────────┐  │
│  │ Student  │ Faculty  │  Admin   │  │
│  │ (active) │          │          │  │
│  └──────────┴──────────┴──────────┘  │
│      ↑           ↑           ↑        │
│   Filled      Transparent  Transparent│
│   Violet      Muted text  Muted text  │
└──────────────────────────────────────┘
```

### Input Fields (Pill-shaped with Icons)
```
Email:
┌────────────────────────────────┐
│ [👤]  student@charusat.edu.in │
└────────────────────────────────┘
   ↑
  Icon inside left

Password:
┌────────────────────────────────┐
│ [🔒]  ••••••••••••       [👁] │
└────────────────────────────────┘
   ↑                        ↑
  Lock icon            Show/hide
```

### Login Button (Gradient)
```
┌────────────────────────────────┐
│          Login                 │
│   [Violet → Indigo gradient]   │
│   [Hover: glowing effect]      │
└────────────────────────────────┘
```

### Right Panel Features
1. **Particle Animation**: Animated violet nodes and connecting lines (confined to right panel)
2. **Gradient Background**: Diagonal sweep with soft geometric overlay
3. **Floating Decorative Shapes**: 3-4 soft blurred circles (violet/gold)
4. **Student Illustration**: Central focal point (placeholder provided)
5. **Branding**: Logo at top, tagline at bottom

## Responsive Breakpoints

- **Mobile**: < 1024px
  - Right panel hidden
  - Left panel full width
  - Vertical stacking

- **Desktop**: ≥ 1024px
  - Two-panel split (40/60)
  - Side-by-side layout
  - Full visual experience

## Interactive Elements

1. **Role Tabs**: Click to switch, active state follows selection
2. **Input Fields**: Focus ring in violet on click
3. **Show/Hide Password**: Toggle eye icon
4. **Remember Me**: Checkbox with violet accent when checked
5. **Login Button**: Scale down on click, glow on hover
6. **Google Modal**: Opens on "Continue with Google" click
7. **Forgot Password**: Transitions to reset flow
8. **Theme Toggle**: Top-right corner, smooth transition

## Assets Created

1. **`/assets/illustrations/student-illustration.svg`**
   - Simple placeholder SVG
   - Can be replaced with professional 3D illustration
   - Graceful fallback if missing (gradient glow)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid for layout
- Framer Motion for animations
- Tailwind CSS for styling
