import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const electronBinary = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron');
const hasLocalElectron = fs.existsSync(electronBinary);

const command = hasLocalElectron ? electronBinary : (process.platform === 'win32' ? 'npx.cmd' : 'npx');
const args = hasLocalElectron ? ['electron/main.cjs'] : ['electron', 'electron/main.cjs'];

const child = spawn(command, args, {
	stdio : 'inherit',
	env   : {
		...process.env,
		NODE_ENV    : process.env.NODE_ENV || 'local',
		HB_ELECTRON : '1'
	}
});

child.on('exit', (code)=>{
	process.exit(code ?? 0);
});

child.on('error', (error)=>{
	console.error('Unable to launch Electron. Ensure `electron` is installed or `npx` is available.');
	console.error(error.message);
	process.exit(1);
});
