const { v4 } = require('uuid');
const { resolve } = require('path');
const { spawn } = require('child_process');

const repos = require('./migration');

const spawn$ = (...args) => new Promise((resolve, reject) => {
  console.log('args', args);
  const cmd = spawn(...args);
  cmd.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
  cmd.on('close', (code) => code === 0 ? resolve(): reject(code));
});

const migrate$ = async (src, dest) => {
  const uid = v4();
  await spawn$('git', ['clone', '--bare', src, `${uid}.git`], {
    cwd: resolve('repositories'),
  });

  await spawn$('git', ['push', '--mirror', dest], {
    cwd: resolve('repositories', `${uid}.git`),
  });
};

repos.forEach(async ({ old: src, new: dest }) => {
  if(!src || !dest) {
    return;
  }

  try {
    await migrate$(src, dest);
  } catch(e) {
    console.log(`enable to migrate the repository "${src}"`);
  }
});
