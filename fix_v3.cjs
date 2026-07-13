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
  content = content.replace(/fetch\('\/api\/([^`]+)\`\)/g, "fetch('/api/$1')");
  content = content.replace(/fetch\('\/api\/([^`]+)\`,/g, "fetch('/api/$1',");
  
  // For templates like `await fetch('/api/client_invoices/${id}`, {`
  content = content.replace(/fetch\('\/api\/(.*)\$\{/g, "fetch(`/api/$1${");
  fs.writeFileSync(file, content);
});
