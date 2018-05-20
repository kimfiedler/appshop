function buildCommand(yargs, config) {
  return yargs.command(['appshop <command>', 'app'], 'Work on applications', yargs => {
    yargs.commandDir('commands');
  });
}

module.exports = {
  buildCommand,
};
