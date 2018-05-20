exports.command = 'create <type>';
exports.desc = 'Create a new application or part';
exports.builder = yargs => {
  return yargs.commandDir('create_cmds');
};
exports.handler = function(argv) {};
