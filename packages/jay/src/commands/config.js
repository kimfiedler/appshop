exports.command = 'config <command>';
exports.desc = 'Manage application configuration';
exports.builder = yargs => {
  return yargs.commandDir('config_cmds');
};
exports.handler = function(argv) {};
