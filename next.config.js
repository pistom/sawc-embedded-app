/** @type {import('next').NextConfig} */
const os = require('os');
function getLocalIpAddress() {
	const networkInterfaces = os.networkInterfaces();
	for (const key in networkInterfaces) {
		const networkInterface = networkInterfaces[key];
		for (const entry of networkInterface) {
			if (!entry.internal && entry.family === 'IPv4') {
				return entry.address;
			}
		}
	}
	return '127.0.0.1';
}

const nextConfig = {
  env: {
    controllerIP: getLocalIpAddress() || 'test',
  }
}

module.exports = nextConfig
