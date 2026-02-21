import globalJsdom from 'jsdom-global';
globalJsdom();
import { safeHTML } from '../../client/homebrew/brewRenderer/safeHTML';

test('Exit if no document', function() {
	const doc = document;
	document = undefined;

	const result = safeHTML('');

	document = doc;

	expect(result).toBe(null);
});

test('Javascript via href', function() {
	const source = `<a href="javascript:alert('This is a JavaScript injection via href attribute')">Click me</a>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<a>Click me</a>');
});

test('Javascript via src', function() {
	const source = `<img src="javascript:alert('This is a JavaScript injection via src attribute')">`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<img>');
});

test('Javascript via form submit action', function() {
	const source = `<form action="javascript:alert('This is a JavaScript injection via action attribute')">\n<input type="submit" value="Submit">\n</form>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<form>\n<input value=\"Submit\">\n</form>');
});

test('Javascript via inline event handler - onClick', function() {
	const source = `<div style="background-color: red; color: white; width: 100px; height: 100px;" onclick="alert('This is a JavaScript injection via inline event handler')">\nClick me\n</div>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div style=\"background-color: red; color: white; width: 100px; height: 100px;\">\nClick me\n</div>');
});

test('Javascript via inline event handler - onMouseOver', function() {
	const source = `<div onmouseover="alert('This is a JavaScript injection via inline event handler')">Hover over me</div>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div>Hover over me</div>');
});

test('Javascript via data attribute', function() {
	const source = `<div data-code="javascript:alert('This is a JavaScript injection via data attribute')">Test</div>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div>Test</div>');
});

test('Javascript via event delegation', function() {
	const source = `<div id="parent"><button id="child">Click me</button></div><script>document.getElementById('parent').addEventListener('click', function(event) {if (event.target.id === 'child') {console.log('This is JavaScript executed via event delegation');}});</script>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div id="parent"><button id="child">Click me</button></div>');
});

test('Electron mode rewrites local file src paths', function() {
	const originalConfig = global.config;
	let rendered;
	try {
		global.config = { electron: true };
		const source = `<img src="file:///Users/test/images/cover.png">`;
		rendered = safeHTML(source);
	} finally {
		global.config = originalConfig;
	}
	expect(rendered).toBe('<img src="/local-file?path=%2FUsers%2Ftest%2Fimages%2Fcover.png">');
});

test('Electron mode rewrites local file urls in style attributes', function() {
	const originalConfig = global.config;
	let rendered;
	try {
		global.config = { electron: true };
		const source = `<div style="background-image: url('file:///Users/test/images/parchment.png');"></div>`;
		rendered = safeHTML(source);
	} finally {
		global.config = originalConfig;
	}
	expect(rendered).toBe('<div style="background-image: url(\'/local-file?path=%2FUsers%2Ftest%2Fimages%2Fparchment.png\');"></div>');
});

test('Web mode leaves local file src paths unchanged', function() {
	const originalConfig = global.config;
	let rendered;
	try {
		global.config = { electron: false };
		const source = `<img src="file:///Users/test/images/cover.png">`;
		rendered = safeHTML(source);
	} finally {
		global.config = originalConfig;
	}
	expect(rendered).toBe('<img src="file:///Users/test/images/cover.png">');
});
test('Blacklisted tags - script', function() {
	const source = `<div>Before</div><script>alert('xss')</script><div>After</div>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div>Before</div><div>After</div>');
});

test('Blacklisted tags - noscript', function() {
	const source = `<div>Test</div><noscript>No script content</noscript>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div>Test</div>');
});

test('Blacklisted tags - noembed', function() {
	const source = `<div>Content</div><noembed>Embed fallback</noembed>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div>Content</div>');
});

test('Remove type=submit attribute', function() {
	const source = `<input type="submit" value="Send">`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<input value="Send">');
});

test('JavaScript in href with Unicode whitespace', function() {
	const source = `<a href="  javascript:alert('xss')">Link</a>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<a>Link</a>');
});

test('Electron mode - Windows UNC path', function() {
	const originalConfig = global.config;
	let rendered;
	try {
		global.config = { electron: true };
		const source = `<img src="file://server/share/image.png">`;
		rendered = safeHTML(source);
	} finally {
		global.config = originalConfig;
	}
	expect(rendered).toBe('<img src="/local-file?path=%5C%5Cserver%5Cshare%5Cimage.png">');
});

test('Electron mode - Windows drive letter path', function() {
	const originalConfig = global.config;
	let rendered;
	try {
		global.config = { electron: true };
		const source = `<img src="file:///C:/Users/test/image.png">`;
		rendered = safeHTML(source);
	} finally {
		global.config = originalConfig;
	}
	expect(rendered).toBe('<img src="/local-file?path=C%3A%2FUsers%2Ftest%2Fimage.png">');
});

test('Electron mode - href with file URL', function() {
	const originalConfig = global.config;
	let rendered;
	try {
		global.config = { electron: true };
		const source = `<a href="file:///home/user/document.pdf">Doc</a>`;
		rendered = safeHTML(source);
	} finally {
		global.config = originalConfig;
	}
	expect(rendered).toBe('<a href="/local-file?path=%2Fhome%2Fuser%2Fdocument.pdf">Doc</a>');
});

test('Electron mode - style with multiple file URLs', function() {
	const originalConfig = global.config;
	let rendered;
	try {
		global.config = { electron: true };
		const source = `<div style="background: url('file:///path/bg.png'), url('file:///path/overlay.png');"></div>`;
		rendered = safeHTML(source);
	} finally {
		global.config = originalConfig;
	}
	expect(rendered).toBe(`<div style="background: url('/local-file?path=%2Fpath%2Fbg.png'), url('/local-file?path=%2Fpath%2Foverlay.png');"></div>`);
});

test('Invalid file URL in Electron mode', function() {
	const originalConfig = global.config;
	let rendered;
	try {
		global.config = { electron: true };
		const source = `<img src="file://not-a-valid-url[">`;
		rendered = safeHTML(source);
	} finally {
		global.config = originalConfig;
	}
	expect(rendered).toBe('<img src="file://not-a-valid-url[">');
});

test('Non-file protocol URL in Electron mode', function() {
	const originalConfig = global.config;
	let rendered;
	try {
		global.config = { electron: true };
		const source = `<img src="https://example.com/image.png">`;
		rendered = safeHTML(source);
	} finally {
		global.config = originalConfig;
	}
	expect(rendered).toBe('<img src="https://example.com/image.png">');
});

test('Preserve safe attributes', function() {
	const source = `<div id="test" class="container" data-value="safe">Content</div>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div id="test" class="container">Content</div>');
});

test('Remove all onclick-like handlers', function() {
	const source = `<button onload="alert(1)" onerror="alert(2)" onfocus="alert(3)">Button</button>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<button>Button</button>');
});

test('Nested elements with mixed safe and unsafe content', function() {
	const source = `<div><p onclick="alert(1)">Text</p><script>bad();</script><span>Safe</span></div>`;
	const rendered = safeHTML(source);
	expect(rendered).toBe('<div><p>Text</p><span>Safe</span></div>');
});

test('Empty string input', function() {
	const source = '';
	const rendered = safeHTML(source);
	expect(rendered).toBe('');
});

test('Plain text without HTML', function() {
	const source = 'Just plain text';
	const rendered = safeHTML(source);
	expect(rendered).toBe('Just plain text');
});
