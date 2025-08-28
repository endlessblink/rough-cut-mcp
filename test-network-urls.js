/**
 * Test script for network URL detection
 * Run this to verify the network utility is working correctly
 */

import { buildNetworkUrls, formatStudioUrls, getNetworkAddress } from './build/utils/network-utils.js';

console.log('Testing Network URL Detection\n');
console.log('='.repeat(50));

// Test network address detection
const networkAddr = getNetworkAddress();
console.log('Detected network address:', networkAddr);
console.log('');

// Test URL building for different ports
const testPorts = [7400, 3000, 8080];

for (const port of testPorts) {
  console.log(`\nTesting port ${port}:`);
  console.log('-'.repeat(30));
  
  const urls = buildNetworkUrls(port);
  
  console.log('URLs object:', JSON.stringify(urls, null, 2));
  console.log('');
  
  console.log('Formatted output:');
  const formatted = formatStudioUrls(urls, true);
  formatted.forEach(line => console.log(line));
}

// Test with environment variables
console.log('\n' + '='.repeat(50));
console.log('Testing with environment variables:');
console.log('-'.repeat(30));

// Test with tunnel URL
process.env.REMOTION_TUNNEL_URL = 'https://example.ngrok.io';
const tunnelUrls = buildNetworkUrls(7400);
console.log('\nWith REMOTION_TUNNEL_URL:');
console.log('Primary URL:', tunnelUrls.primary);
console.log('Tunnel URL:', tunnelUrls.tunnel);

// Test with public host
delete process.env.REMOTION_TUNNEL_URL;
process.env.REMOTION_PUBLIC_HOST = '192.168.1.100';
const publicUrls = buildNetworkUrls(7400);
console.log('\nWith REMOTION_PUBLIC_HOST:');
console.log('Primary URL:', publicUrls.primary);

console.log('\n' + '='.repeat(50));
console.log('Test completed successfully!');