import { spawn } from 'cross-spawn';

export const PROCESS_EXIT_EVENTS = [
  'beforeExit',
  'uncaughtExceptionMonitor',
  'SIGINT',
  'SIGTERM',
  'SIGHUP',
  'SIGBREAK',
] as const;

export class CommandFailureError extends Error {
  constructor(command: string, exitCode: number | null, signal: NodeJS.Signals | null) {
    super(`The command '${command}' exited ${exitCode === null ? `after signal ${signal}` : `with code ${exitCode}`}.`);
    this.name = 'CommandFailureError';
  }
}

export async function runCommand(command: string, commandArguments: string[]) {
  await new Promise<void>((resolve, reject) => {
    const childProcess = spawn(command, commandArguments, {
      stdio: 'inherit',
    });

    childProcess.once('error', (error) => {
      childProcess.removeAllListeners();
      reject(error);
    });

    childProcess.once('exit', (exitCode, signal) => {
      childProcess.removeAllListeners();

      if (exitCode === 0) {
        resolve();
        return;
      }

      const error = new CommandFailureError(command, exitCode, signal);
      reject(error);
    });
  });
}
