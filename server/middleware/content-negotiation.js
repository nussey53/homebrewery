import config from '../config.js';

const isLocalEnvironment = ()=>{
	const nodeEnv = process.env.NODE_ENV || config.get('node_env');
	return config.get('local_environments').includes(nodeEnv);
};

export default (req, res, next)=>{
	const isElectronEnvironment = process.env.HB_ELECTRON === '1';
	const isImageRequest = req.get('Accept')?.split(',')
        ?.filter((h)=>!h.includes('q='))
        ?.every((h)=>/image\/.*/.test(h));
	const allowStaticImages = isLocalEnvironment() && req.url?.startsWith('/staticImages');
	const allowElectronLocalImages = isLocalEnvironment() && isElectronEnvironment && req.url?.startsWith('/local-file');

	if(isImageRequest && !(allowStaticImages || allowElectronLocalImages)) {
		return res.status(406).send({
			message : 'Request for image at this URL is not supported'
		});
	}

	next();
};
