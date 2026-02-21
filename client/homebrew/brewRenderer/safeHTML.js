// Derived from the vue-html-secure package, customized for Homebrewery

let doc = null;
let div = null;

const FILE_PROTOCOL = 'file://';
const fileUrlPattern = /url\(\s*(['"]?)(file:\/\/[^'")]+)\1\s*\)/gi;

const rewriteFileUrlForElectron = (value)=>{
	if(typeof value !== 'string') return value;
	const trimmedValue = value.trim();
	if(!trimmedValue.toLowerCase().startsWith(FILE_PROTOCOL)) return value;

	try {
		const parsed = new URL(trimmedValue);
		if(parsed.protocol !== 'file:') return value;

		let filePath = decodeURIComponent(parsed.pathname);
		if(parsed.host && parsed.host !== 'localhost') {
			filePath = `\\\\${parsed.host}${filePath.replaceAll('/', '\\')}`;
		} else if(/^\/[a-zA-Z]:/.test(filePath)) {
			filePath = filePath.substring(1);
		}

		return `/local-file?path=${encodeURIComponent(filePath)}`;
	} catch {
		return value;
	}
};

const rewriteFileUrlsInStyleValue = (styleValue)=>{
	if(typeof styleValue !== 'string') return styleValue;
	return styleValue.replace(fileUrlPattern, (_match, quote, rawUrl)=>{
		return `url(${quote}${rewriteFileUrlForElectron(rawUrl)}${quote})`;
	});
};

const rewriteLocalFileAttribute = (attribute)=>{
	if(attribute.localName === 'src' || attribute.localName === 'href') {
		return rewriteFileUrlForElectron(attribute.value);
	}
	if(attribute.localName === 'style') {
		return rewriteFileUrlsInStyleValue(attribute.value);
	}
	return attribute.value;
};

function safeHTML(htmlString) {
	// If the Document interface doesn't exist, exit
	if(typeof document == 'undefined') return null;
	// If the test document and div don't exist, create them
	if(!doc) doc = document.implementation.createHTMLDocument('');
	if(!div) div = doc.createElement('div');

	// Set the test div contents to the evaluation string
	div.innerHTML = htmlString;
	// Grab all nodes from the test div
	const elements = div.querySelectorAll('*');

	// Blacklisted tags
	const blacklistTags = ['script', 'noscript', 'noembed'];
	// Tests to remove attributes
	const blacklistAttrs = [
		(test)=>{return test.localName.indexOf('on') == 0;},
		(test)=>{return test.localName.indexOf('type') == 0 && test.value.match(/submit/i);},
		(test)=>{return test.value.replace(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g, '').toLowerCase().trim().indexOf('javascript:') == 0;}
	];
	const shouldRewriteLocalFiles = Boolean(globalThis?.config?.electron);


	elements.forEach((element)=>{
		// Check each element for blacklisted type
		if(blacklistTags.includes(element?.localName?.toLowerCase())) {
			element.remove();
			return;
		}
		// Check remaining elements for blacklisted attributes
		for (const attribute of Array.from(element.attributes)){
			if(blacklistAttrs.some((test)=>{return test(attribute);})) {
				element.removeAttribute(attribute.localName);
				break;
			};

			if(shouldRewriteLocalFiles) {
				const rewrittenValue = rewriteLocalFileAttribute(attribute);
				if(rewrittenValue !== attribute.value) {
					element.setAttribute(attribute.localName, rewrittenValue);
				}
			}
		};
	});

	return div.innerHTML;
};

module.exports.safeHTML = safeHTML;
