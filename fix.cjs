const fs = require('fs');
const files = [
  'src/components/ContentPlanner.tsx',
  'src/components/AdminInvoiceManager.tsx',
  'src/pages/Register.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/pages/Login.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Revert back
  content = content.replace(/fetch\(`\$\{import\.meta\.env\.VITE_API_URL \|\| ''\}\/api\//g, "fetch('/api/");
  fs.writeFileSync(file, content);
});
