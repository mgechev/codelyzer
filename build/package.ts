process.stdin.setEncoding('utf8');

const blacklist = ['scripts', 'devDependencies'];

process.stdin.resume();
process.stdin.setEncoding('utf8');

let packageJson = '';
process.stdin.on('data', (chunk: string) => {
  packageJson += chunk;
});
process.stdin.on('end', () => {
  let parsed: any;
  try {
    parsed = JSON.parse(packageJson);
  } catch (e) {
    console.error('Cannot parse to JSON');
    process.exit(1);
  }
  const result = {};
  Object.keys(parsed).forEach((key: string) => {
    if (blacklist.indexOf(key) < 0) {
      result[key] = parsed[key];
    }
  });
  process.stdout.write(JSON.stringify(result, null, 2));
  packageJson = '';
});
