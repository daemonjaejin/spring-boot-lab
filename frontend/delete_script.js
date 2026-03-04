const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'src/main.tsx',
  'src/main.tsx.bak',
  'src/components/AppLayout.tsx',
  'src/components/AppLayoutNext.tsx'
];

filesToDelete.forEach(file => {
  const p = path.join(__dirname, file);
  if (fs.existsSync(p)) {
    try {
      fs.unlinkSync(p);
      console.log('Deleted:', p);
    } catch (e) {
      console.error('Failed to delete:', p, e.message);
    }
  }
});

const pagesDir = path.join(__dirname, 'src/pages');
if (fs.existsSync(pagesDir)) {
  try {
    fs.rmSync(pagesDir, { recursive: true, force: true });
    console.log('Deleted:', pagesDir);
  } catch (e) {
    console.error('Failed to delete:', pagesDir, e.message);
  }
}
