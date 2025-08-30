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
        };
        required?: undefined;
    };
})[];
export declare function handleToolCall(name: string, args: any): Promise<any>;
//# sourceMappingURL=tools.d.ts.map