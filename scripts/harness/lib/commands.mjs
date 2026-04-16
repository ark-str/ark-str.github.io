import fs from "node:fs";
import { spawn, spawnSync } from "node:child_process";

export function formatCommand(command, args) {
  return [command, ...args].join(" ");
}

export function runCommand(command, args, options = {}) {
  const {
    cwd = process.cwd(),
    env = process.env,
    input,
    dryRun = false,
    allowFailure = false,
  } = options;

  if (dryRun) {
    return {
      status: 0,
      stdout: "",
      stderr: "",
      dryRun: true,
      commandLine: formatCommand(command, args),
    };
  }

  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    input,
    shell: false,
  });

  if (!allowFailure && result.status !== 0) {
    throw new Error(
      `Command failed: ${formatCommand(command, args)}\n${result.stderr || result.stdout || ""}`,
    );
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    dryRun: false,
    commandLine: formatCommand(command, args),
  };
}

export function runJsonCommand(command, args, options = {}) {
  const result = runCommand(command, args, options);
  if (result.dryRun) {
    return {};
  }

  return JSON.parse(result.stdout);
}

export function spawnStreamingCommand(command, args, options = {}) {
  const {
    cwd = process.cwd(),
    env = process.env,
    dryRun = false,
    logFilePath,
  } = options;

  if (dryRun) {
    if (logFilePath) {
      fs.writeFileSync(
        logFilePath,
        `[dry-run] ${formatCommand(command, args)}\n`,
        "utf8",
      );
    }

    return Promise.resolve({
      status: 0,
      stdout: "",
      stderr: "",
      dryRun: true,
      commandLine: formatCommand(command, args),
    });
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const value = chunk.toString();
      stdout += value;
      process.stdout.write(value);
    });

    child.stderr.on("data", (chunk) => {
      const value = chunk.toString();
      stderr += value;
      process.stderr.write(value);
    });

    child.on("error", reject);

    child.on("close", (status) => {
      if (logFilePath) {
        fs.writeFileSync(
          logFilePath,
          `# ${formatCommand(command, args)}\n\n## stdout\n${stdout}\n\n## stderr\n${stderr}\n`,
          "utf8",
        );
      }

      resolve({
        status: status ?? 1,
        stdout,
        stderr,
        dryRun: false,
        commandLine: formatCommand(command, args),
      });
    });
  });
}
