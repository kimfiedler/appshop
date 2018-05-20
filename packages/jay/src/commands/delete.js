exports.command = 'delete <type>';
exports.desc = 'Delete an application or part';
exports.builder = yargs => {
  return yargs.commandDir('delete_cmds');
};
exports.handler = function(argv) {};
