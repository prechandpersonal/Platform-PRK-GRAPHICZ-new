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
  content = content.replace(/fetch\('\/api\//g, "fetch(`${import.meta.env.VITE_API_URL || ''}/api/");
  content = content.replace(/fetch\(`\/api\//g, "fetch(`${import.meta.env.VITE_API_URL || ''}/api/");
  // wait, the ones with single quotes now need closing backticks
  content = content.replace(/fetch\(\`\$\{import\.meta\.env\.VITE_API_URL \|\| ''\}\/api\/([^']+)'\)/g, "fetch(`${import.meta.env.VITE_API_URL || ''}/api/$1`)");
  
  // ones with template literals originally got replaced to single quote in `fix.cjs`.
  content = content.replace(/fetch\('\/api\/\$\{([^}]+)\}`,/g, "fetch(`${import.meta.env.VITE_API_URL || ''}/api/${$1}`,");
  content = content.replace(/fetch\('\/api\/\$\{([^}]+)\}'\)/g, "fetch(`${import.meta.env.VITE_API_URL || ''}/api/${$1}`)");
  
  fs.writeFileSync(file, content);
});
