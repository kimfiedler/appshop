exports.command = 'list <type>';
exports.desc = 'List applications or parts';
exports.builder = yargs => {
  return yargs.commandDir('list_cmds');
};
exports.handler = function(argv) {};
