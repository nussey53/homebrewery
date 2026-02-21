const { app, BrowserWindow, dialog, shell } = require('electron');
const { spawn } = require('child_process');
const http = require('http');
const net = require('net');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

let serverProcess = null;
let isQuitting = false;
let serverPort = Number(process.env.PORT) || 8000;

const isPortAvailable = (port)=>new Promise((resolve)=>{
	const tester = net.createServer();
	tester.once('error', ()=>resolve(false));
	tester.once('listening', ()=>{
		tester.close(()=>resolve(true));
	});
	tester.listen(port, '127.0.0.1');
});

const findAvailablePort = async (startPort = 8000, attempts = 30)=>{
	for (let index = 0; index < attempts; index += 1) {
		const candidate = startPort + index;
		if(await isPortAvailable(candidate)) return candidate;
	}
	throw new Error(`No open port found between ${startPort} and ${startPort + attempts - 1}.`);
};

const waitForServer = (url, timeoutMs = 30000)=>new Promise((resolve, reject)=>{
	const startTime = Date.now();

	const attempt = ()=>{
		const request = http.get(url, (response)=>{
			response.resume();
			if(response.statusCode && response.statusCode < 500) {
				resolve();
				return;
			}
			if(Date.now() - startTime > timeoutMs) {
				reject(new Error(`Timed out waiting for server at ${url}.`));
				return;
			}
			setTimeout(attempt, 300);
		});

		request.on('error', ()=>{
			if(Date.now() - startTime > timeoutMs) {
				reject(new Error(`Timed out waiting for server at ${url}.`));
				return;
			}
			setTimeout(attempt, 300);
		});
	};

	attempt();
});

const stopServer = ()=>{
	if(!serverProcess || serverProcess.killed) return;
	serverProcess.kill('SIGTERM');
};

const startServer = ()=>{
	serverProcess = spawn(process.execPath, ['server.js'], {
		cwd   : REPO_ROOT,
		env   : {
			...process.env,
			NODE_ENV    : process.env.NODE_ENV || 'local',
			HB_ELECTRON : '1',
			PORT        : String(serverPort)
		},
		stdio : 'inherit'
	});

	serverProcess.on('exit', (code)=>{
		if(!isQuitting) {
			dialog.showErrorBox('Homebrewery server stopped', `The embedded server exited with code ${code ?? 'unknown'}.`);
			app.quit();
		}
	});
};

const createMainWindow = ()=>{
	const window = new BrowserWindow({
		width           : 1440,
		height          : 960,
		minWidth        : 1120,
		minHeight       : 720,
		autoHideMenuBar : true,
		webPreferences  : {
			nodeIntegration  : false,
			contextIsolation : true,
			sandbox          : true
		}
	});

	window.webContents.setWindowOpenHandler(({ url })=>{
		shell.openExternal(url);
		return { action: 'deny' };
	});

	window.loadURL(`http://127.0.0.1:${serverPort}`);
};

app.on('before-quit', ()=>{
	isQuitting = true;
	stopServer();
});

app.on('window-all-closed', ()=>{
	if(process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', ()=>{
	if(BrowserWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});

app.whenReady().then(async ()=>{
	serverPort = await findAvailablePort(serverPort);
	startServer();
	await waitForServer(`http://127.0.0.1:${serverPort}`);
	createMainWindow();
}).catch((error)=>{
	dialog.showErrorBox('Unable to launch Homebrewery', error.message);
	app.quit();
});
