const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            if (!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walk(file));
            }
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:/sewachak/Civiconnect/frontend');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('http://localhost:3001')) {
        content = content.replace(/`http:\/\/localhost:3001([^`]*)`/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}$1`");
        content = content.replace(/'http:\/\/localhost:3001([^']*)'/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}$1`");
        content = content.replace(/"http:\/\/localhost:3001([^"]*)"/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}$1`");
        
        fs.writeFileSync(file, content);
        console.log('Updated', file);
    }
});
