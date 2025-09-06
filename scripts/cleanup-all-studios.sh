#!/bin/bash

echo "🧹 Cleaning up ALL failed Remotion Studio processes and projects..."

# Kill all remotion and npm processes
echo "🔪 Killing all Remotion processes..."
pkill -f "remotion studio" || true
pkill -f "npm start" || true
pkill -f "npx remotion" || true

# Wait for processes to die
sleep 3

# Check what ports are actually in use
echo "🔍 Checking port usage in 7080-7900 range..."
for port in {7080..7900}; do
  if netstat -tuln 2>/dev/null | grep -q ":$port "; then
    echo "  ⚠️  Port $port is in use"
  fi
done

# Kill any remaining processes on our port range
echo "💀 Force killing any processes on ports 7080-7900..."
for port in {7080..7900}; do
  if netstat -tuln 2>/dev/null | grep -q ":$port "; then
    fuser -k $port/tcp 2>/dev/null || true
  fi
done

echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create ONE simple test project manually"
echo "2. Verify it works before trying MCP conversion"
echo "3. Copy the EXACT working pattern"
echo ""
echo "🚫 DO NOT:"
echo "- Create multiple projects at once"
echo "- Use complex animations with canvas/useRef"  
echo "- Hardcode any ports"
echo ""