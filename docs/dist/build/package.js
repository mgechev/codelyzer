process.stdin.setEncoding('utf8');
var blacklist = [
    'scripts',
    'devDependencies'
];
process.stdin.resume();
process.stdin.setEncoding('utf8');
var packageJson = '';
process.stdin.on('data', function (chunk) {
    packageJson += chunk;
});
process.stdin.on('end', function () {
    var parsed;
    try {
        parsed = JSON.parse(packageJson);
    }
    catch (e) {
        console.error('Cannot parse to JSON');
        process.exit(1);
    }
    var result = {};
    Object.keys(parsed).forEach(function (key) {
        if (blacklist.indexOf(key) < 0) {
            result[key] = parsed[key];
        }
    });
    process.stdout.write(JSON.stringify(result, null, 2));
    packageJson = '';
});
