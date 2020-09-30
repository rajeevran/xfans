var args = process.argv.slice(2);

if (args.length && !args[0]) {
  console.log('Missing component');
  process.exit();
} else {
  let file = args[0];
  console.log('Start to run the script...');
  require('./' + file)(function(err) {
    if (err) {
      console.log(err);
    }

    console.log('Done script!');
    process.exit();
  });
}
