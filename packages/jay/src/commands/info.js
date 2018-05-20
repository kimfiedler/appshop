exports.command = 'info <type>';
exports.desc = 'Info on applications or parts';
exports.builder = yargs => {
  return yargs.commandDir('info_cmds');
};
exports.handler = function(argv) {};
