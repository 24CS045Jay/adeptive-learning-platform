# Right Panel Layout Reference

## Visual Structure

```
┌───────────────────────────────────────────────────────┐
│                  RIGHT PANEL (60% width)              │
│                                                       │
│  [Animated particle nodes and connecting lines]      │
│  [Gradient: Indigo → Violet → Purple]                │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │         [Graduation Cap Icon]                │    │
│  │              AI Tutor                        │    │
│  │   Your Syllabus-Grounded Study Companion    │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│         [Floating decorative shapes]                  │
│            ○ (violet blur)                           │
│                        ○ (gold blur)                 │
│                                                       │
│                                                       │
│              ┌────────────────────┐                  │
│              │                    │                  │
│              │   👨‍🎓 3D CHARACTER  │                  │
│              │                    │                  │
│              │  • Denim jacket    │                  │
│              │  • Backpack        │                  │
│              │  • Holding books   │                  │
│              │  • Pointing up     │                  │
│              │  • Enthusiastic    │                  │
│              │                    │                  │
│              │  (bottom-aligned)  │                  │
│              └────────────────────┘                  │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  CSPIT CSE · RAG-Powered Learning Platform  │    │
│  └─────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────┘
```

## Character Positioning

The 3D student character is positioned at the **bottom-center** of the right panel, similar to your reference image where the character appears to "stand" on the panel.

### Layout Breakdown

1. **Top Section** (20% height)
   - Logo wordmark: "AI Tutor" with graduation cap icon
   - Tagline: "Your Syllabus-Grounded Study Companion"
   - Text color: White (dark mode) or Dark gray (light mode)

2. **Middle Section** (60% height)
   - **Main feature**: 3D student illustration
   - Aligned to bottom of this section
   - Character appears to "stand" at the bottom
   - Background: Animated particles + gradient + decorative shapes
   - Max width: ~500px (responsive)

3. **Bottom Section** (20% height)
   - Small text: "CSPIT CSE · RAG-Powered Learning Platform"
   - Centered, muted color

## Gradient Details

### Dark Mode
```css
background: linear-gradient(135deg, 
  #1e1b3c 0%,      /* Deep indigo */
  #2a1a4f 25%,     /* Dark purple */
  #4a1d7f 50%,     /* Medium purple */
  #5b21b6 75%,     /* Violet */
  #6d28d9 100%     /* Bright purple */
);
```

### Light Mode
```css
background: linear-gradient(135deg,
  #f3e8ff 0%,      /* Very light purple */
  #e9d5ff 25%,     /* Light lavender */
  #d8b4fe 50%,     /* Medium lavender */
  #c084fc 75%,     /* Purple */
  #a855f7 100%     /* Violet */
);
```

## Decorative Elements

### Soft-edged Geometric Overlay
- Position: Top-right corner
- Size: 70% width × 70% height
- Opacity: 20%
- Effect: Diagonal sweep with blur (40px)
- Creates depth and dimension

### Floating Shapes (3 blobs)
1. **Top-left**: Gold-ish blob (w: 24, h: 24) at 15% from top, 10% from left
2. **Bottom-left**: Violet blob (w: 16, h: 16) at 25% from bottom, 20% from left
3. **Middle-right**: Gold blob (w: 20, h: 20) at 45% from top, 15% from right

All with blur: 15-20px, opacity: 10%

## Particle Animation

- **Nodes**: 14 violet circles (2-4px radius)
- **Connections**: Lines connecting nearby nodes (< 180px distance)
- **Movement**: Gentle floating motion, bounces off edges
- **Opacity**: Low (10-15%) to stay subtle
- **Color**: Violet (#8b5cf6)
- **Confined to**: Right panel only (doesn't overlap form)

## Character Image Specs

### Technical Requirements
```yaml
File: student-illustration.png
Format: PNG with transparency
Width: 800-1200px
Height: 1000-1500px
Aspect: Portrait (taller than wide)
Size: < 500KB
Quality: High resolution, crisp edges
Background: Transparent (preferred)
```

### Visual Requirements
```yaml
Character: Male student, 18-25 appearance
Outfit: 
  - Denim jacket (primary)
  - Casual white/light shirt underneath
  - Jeans or casual pants
  - Sneakers or casual shoes
Accessories:
  - Backpack on shoulder/back
  - Books, notebook, or tablet in hand
Pose:
  - Standing upright
  - One finger pointing up (engaged/eureka moment)
  - OR holding study materials
  - Friendly, approachable stance
Expression:
  - Enthusiastic smile
  - Engaged, attentive
  - Friendly and welcoming
Style:
  - 3D render (Pixar/Disney-like)
  - Modern, clean
  - Smooth textures
  - Professional quality
```

## Responsive Behavior

### Desktop (≥1024px)
- Right panel visible
- Character full size (~400-500px width)
- All decorative elements visible

### Tablet (768px - 1023px)
- Right panel hidden
- Form takes full width

### Mobile (<768px)
- Right panel hidden
- Form takes full width
- Character not shown (saves load time)

## Color Harmony

The character's outfit should complement:
- **Violet accent**: #8b5cf6 (dark) / #7c3aed (light)
- **Gold accent**: #f5c451 (dark) / #d97706 (light)
- **Background gradient**: Purple spectrum

**Tip**: Denim blue naturally complements the violet theme!

## Drop Shadow

The character has a dramatic drop shadow for depth:
```css
filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3));
```

This creates the illusion that the character is "standing" on the panel.

## Reference Image Match

Your reference shows all these elements:
✅ 3D animated character  
✅ Gradient background (purple tones)  
✅ Character at bottom-center  
✅ Casual student outfit with backpack  
✅ Books/study materials  
✅ Enthusiastic pose  
✅ Clean, modern aesthetic  

The layout is designed to match this exact style!

## Testing Checklist

After adding your image:
- [ ] Character is fully visible (not cut off)
- [ ] Drop shadow looks natural
- [ ] Character aligns to bottom-center
- [ ] Proportions look correct
- [ ] Image is crisp, not pixelated
- [ ] Works in both dark and light mode
- [ ] Loads quickly (< 500KB file size)
- [ ] Transparent background blends with gradient
