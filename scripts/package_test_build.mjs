import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const output = path.resolve('release/Akshigo-8.0.0-test.1-win-x64');
const copy = (source, target) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
};
if (!fs.existsSync(path.join(output, 'Akshigo-PC-Toolkit-Pro.exe'))) throw new Error('Compile the real host before packaging.');
copy('dist', path.join(output, 'dist'));
copy('build/desktop-server.cjs', path.join(output, 'backend/server.cjs'));
copy('server/operations/windows', path.join(output, 'server/operations/windows'));
copy('.tools/node-download/node.exe', path.join(output, 'runtime/node.exe'));
copy('.tools/node-download/LICENSE.txt', path.join(output, 'licenses/Node-LICENSE.txt'));
copy('.tools/dotnet/LICENSE.txt', path.join(output, 'licenses/DotNet-LICENSE.txt'));
copy('.tools/dotnet/ThirdPartyNotices.txt', path.join(output, 'licenses/DotNet-ThirdPartyNotices.txt'));
const webviewRoot = '.tools/nuget/microsoft.web.webview2/1.0.4191.47';
for (const file of fs.readdirSync(webviewRoot).filter(name => /license|notice/i.test(name))) {
  if (fs.statSync(path.join(webviewRoot, file)).isFile()) copy(path.join(webviewRoot, file), path.join(output, 'licenses', `WebView2-${file}`));
}
const metadata = JSON.parse(fs.readFileSync('build/desktop-meta.json', 'utf8'));
const frontend = JSON.parse(fs.readFileSync('build/frontend-meta.json', 'utf8'));
Object.assign(metadata.inputs, frontend.inputs);
const packages = new Map();
for (const input of Object.keys(metadata.inputs).filter(name => name.startsWith('node_modules/'))) {
  let dir = path.dirname(input);
  while (dir.startsWith('node_modules')) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      if (pkg.name && pkg.version) packages.set(dir, pkg);
      break;
    }
    dir = path.dirname(dir);
  }
}
const dependencies = [];
for (const [dir, pkg] of packages) {
  const notices = fs.readdirSync(dir).filter(name => /^(licen[cs]e|copying|notice)/i.test(name) && fs.statSync(path.join(dir, name)).isFile());
  if (!notices.length) {
    // A few MIT packages, such as cookie-signature, put the complete grant in README.
    for (const name of fs.readdirSync(dir).filter(name => /^readme/i.test(name))) {
      const content = fs.readFileSync(path.join(dir, name), 'utf8');
      if (content.includes('Permission is hereby granted') && /THE SOFTWARE IS PROVIDED/i.test(content)) notices.push(name);
    }
  }
  if (!notices.length) throw new Error(`Missing bundled dependency license text: ${pkg.name}`);
  for (const file of notices) copy(path.join(dir, file), path.join(output, 'licenses/npm', pkg.name.replaceAll('/', '_'), file));
  dependencies.push({ name: pkg.name, version: pkg.version, license: pkg.license, noticeFiles: notices });
}
fs.writeFileSync(path.join(output, 'licenses/bundled-dependencies.json'), JSON.stringify(dependencies, null, 2));
copy('docs/test-build-readme.txt', path.join(output, 'READ-ME-FIRST.txt'));
const entries = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) walk(file);
    else if (item.name !== 'SHA256SUMS.txt') entries.push(`${crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}  ${path.relative(output, file).replaceAll('\\', '/')}`);
  }
}
walk(output);
fs.writeFileSync(path.join(output, 'SHA256SUMS.txt'), entries.sort().join('\n') + '\n');
console.log(`Packaged ${entries.length} files and ${dependencies.length} dependency notices: ${output}`);
