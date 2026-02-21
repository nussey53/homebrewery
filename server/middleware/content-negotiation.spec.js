import contentNegotiationMiddleware from './content-negotiation.js';

describe('content-negotiation-middleware', ()=>{
	let request;
	let response;
	let next;
	let originalNodeEnv;
	let originalElectronFlag;

	beforeEach(()=>{
		originalNodeEnv = process.env.NODE_ENV;
		originalElectronFlag = process.env.HB_ELECTRON;
		request = {
			get : function(key) {
				return this[key];
			}
		};
		response = {
			status : jest.fn(()=>response),
			send   : jest.fn(()=>{})
		};
		next = jest.fn();
	});

	afterEach(()=>{
		if(originalNodeEnv === undefined) {
			delete process.env.NODE_ENV;
		} else {
			process.env.NODE_ENV = originalNodeEnv;
		}

		if(originalElectronFlag === undefined) {
			delete process.env.HB_ELECTRON;
		} else {
			process.env.HB_ELECTRON = originalElectronFlag;
		}
	});

	it('should return 406 on image request', ()=>{
		contentNegotiationMiddleware({
			Accept : 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
			...request
		}, response);

		expect(response.status).toHaveBeenLastCalledWith(406);
		expect(response.send).toHaveBeenCalledWith({
			message : 'Request for image at this URL is not supported'
		});
	});

	it('should call next on non-image request', ()=>{
		contentNegotiationMiddleware({
			Accept : 'text,image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
			...request
		}, response, next);

		expect(next).toHaveBeenCalled();
	});

	it('should allow local-file image requests in electron mode', ()=>{
		process.env.NODE_ENV = 'local';
		process.env.HB_ELECTRON = '1';

		contentNegotiationMiddleware({
			Accept : 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
			url    : '/local-file?path=%2FUsers%2Ftest%2Fcover.png',
			...request
		}, response, next);

		expect(next).toHaveBeenCalled();
		expect(response.status).not.toHaveBeenCalled();
	});
});
