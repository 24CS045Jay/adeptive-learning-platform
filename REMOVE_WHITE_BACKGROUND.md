# Remove White Background from Student Image

## The Problem
The student illustration has a white background that clashes with the purple UI. We need a transparent background.

## Quick Solution (2 minutes)

### Option 1: Use remove.bg (Easiest - Recommended)
1. Go to **https://www.remove.bg/**
2. Upload your `student-illustration.png`
3. Wait 5 seconds for automatic background removal
4. Download the result
5. Replace the file in `/public/assets/illustrations/student-illustration.png`
6. Refresh your browser - Done! ✅

### Option 2: Use Photopea (Free Photoshop Alternative)
1. Go to **https://www.photopea.com/**
2. Open your `student-illustration.png`
3. Click **Layer** → **Transparency** → **Remove White Matte**
4. Or use the **Magic Wand Tool** (W) → Click white background → Delete
5. **File** → **Export As** → **PNG** (make sure "Transparent" is checked)
6. Save and replace in `/public/assets/illustrations/student-illustration.png`

### Option 3: Use Canva (If you have an account)
1. Go to **https://www.canva.com/**
2. Upload your image
3. Click **Edit Image** → **Background Remover** (Pro feature, but free trial available)
4. Download as PNG
5. Replace in `/public/assets/illustrations/student-illustration.png`

### Option 4: Use Microsoft PowerPoint/Word (Built-in)
1. Insert the image into PowerPoint or Word
2. Click on the image
3. Go to **Picture Format** → **Remove Background**
4. Mark areas to keep/remove
5. Right-click image → **Save as Picture** → PNG
6. Replace in `/public/assets/illustrations/student-illustration.png`

## After Removing Background

Once you have the PNG with transparent background:
1. Replace the file in your project
2. Refresh the browser
3. The character will blend perfectly with the purple gradient! ✨

## Already Done It?

If you've already removed the background but it's still showing white:
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Make sure the file is actually replaced (check the file date/time)
- Verify the PNG has transparency (open in an image viewer with checkered background)

## Technical Note

CSS alone cannot remove an opaque white background from an image - the background is part of the pixel data. You need an image editor or online tool to actually make the background transparent.
