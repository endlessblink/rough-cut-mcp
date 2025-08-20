---
url: "https://www.remotion.dev/docs/ai/mcp"
title: "Remotion's Model Context Protocol | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/ai/mcp#__docusaurus_skipToContent_fallback)

You can use Remotion's Model Context Protocol (MCP) Client to make your editor's AI Chat better at understanding Remotion.

Our MCP server uses [CrawlChat](https://crawlchat.app/)'s technology to index Remotion's documentation into a vector database and

warning

**Test Phase**: Right now, this tool is open without authentication. If running this tool gets too expensive, we might restrict the usage.

To set it up:

[1](https://www.remotion.dev/docs/ai/mcp#1)

Go to your Cursor Settings: `Cmd+Ctrl` \+ `P`, then type `> Cursor Settings` and confirm with Enter.

[2](https://www.remotion.dev/docs/ai/mcp#2)

Add an MCP:

```

json

{
  "mcpServers": {
    "remotion-documentation": {
      "command": "npx",
      "args": ["@remotion/mcp@latest"]
    }
  }
}
```

If this worked, a green dot should show up and the tool `remotion-documentation` should show up.

If you now ask Cursor in the composer to use the Remotion Documentation, the MCP should get invoked.

![](https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/mcp-cursor.png)