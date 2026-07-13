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
  content = content.replace(/\`\$\{import\.meta\.env\.VITE_API_URL \|\| ''\}\/api\//g, "'/api/");
  content = content.replace(/fetch\('\/api\/([^']+)'\)/g, "fetch('/api/$1')");
  content = content.replace(/fetch\('\/api\/([^']+)',/g, "fetch('/api/$1',");
  // we also have template strings like `${import.meta.env.VITE_API_URL || ''}/api/requests/${selectedRequest.id}`
  content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL \|\| ''\}\/api\//g, "/api/");
  fs.writeFileSync(file, content);
});
