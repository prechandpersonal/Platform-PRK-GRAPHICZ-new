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
  content = content.replace(/\$\{id\`/g, "${id}`");
  content = content.replace(/\$\{userId\`/g, "${userId}`");
  content = content.replace(/\$\{editingId\`/g, "${editingId}`");
  content = content.replace(/\$\{selectedRequest\.id\`/g, "${selectedRequest.id}`");
  content = content.replace(/\$\{selectedUser\.id\`/g, "${selectedUser.id}`");
  fs.writeFileSync(file, content);
});
