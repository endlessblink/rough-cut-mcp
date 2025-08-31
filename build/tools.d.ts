export declare function getTools(): ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            project: {
                type: string;
                description: string;
            };
            port: {
                type: string;
                description: string;
            };
            name?: undefined;
            jsx?: undefined;
            basicPrompt?: undefined;
            style?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            port: {
                type: string;
                description: string;
            };
            project?: undefined;
            name?: undefined;
            jsx?: undefined;
            basicPrompt?: undefined;
            style?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            name: {
                type: string;
                description: string;
            };
            jsx: {
                type: string;
                description: string;
            };
            project?: undefined;
            port?: undefined;
            basicPrompt?: undefined;
            style?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            project: {
                type: string;
                description: string;
            };
            jsx: {
                type: string;
                description: string;
            };
            port?: undefined;
            name?: undefined;
            basicPrompt?: undefined;
            style?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            project?: undefined;
            port?: undefined;
            name?: undefined;
            jsx?: undefined;
            basicPrompt?: undefined;
            style?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            project: {
                type: string;
                description: string;
            };
            port?: undefined;
            name?: undefined;
            jsx?: undefined;
            basicPrompt?: undefined;
            style?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            basicPrompt: {
                type: string;
                description: string;
            };
            style: {
                type: string;
                enum: string[];
                description: string;
            };
            project?: undefined;
            port?: undefined;
            name?: undefined;
            jsx?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleToolCall(name: string, args: any): Promise<any>;
//# sourceMappingURL=tools.d.ts.map