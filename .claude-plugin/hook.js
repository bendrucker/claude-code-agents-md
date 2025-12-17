#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
function getStateFilePath(sessionId) {
    return path.join(os.tmpdir(), `claude-agents-md-${sessionId}.json`);
}
function loadInjectedPaths(sessionId) {
    try {
        const stateFilePath = getStateFilePath(sessionId);
        const content = fs.readFileSync(stateFilePath, 'utf-8');
        const state = JSON.parse(content);
        return new Set(state.injected_paths);
    }
    catch {
        return new Set();
    }
}
function saveInjectedPath(sessionId, agentsPath) {
    try {
        const paths = loadInjectedPaths(sessionId);
        paths.add(agentsPath);
        const state = { injected_paths: Array.from(paths) };
        fs.writeFileSync(getStateFilePath(sessionId), JSON.stringify(state, null, 2));
    }
    catch (err) {
        console.error('[agents-md] Failed to save state:', err);
    }
}
function isAlreadyInjected(sessionId, agentsPath) {
    return loadInjectedPaths(sessionId).has(agentsPath);
}
function findClosestAgentsMd(filePath, projectRoot) {
    let currentDir = path.dirname(path.resolve(filePath));
    const resolvedRoot = path.resolve(projectRoot);
    while (true) {
        const agentsPath = path.join(currentDir, 'AGENTS.md');
        if (fs.existsSync(agentsPath)) {
            return agentsPath;
        }
        if (currentDir === resolvedRoot) {
            break;
        }
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }
    return null;
}
function outputContext(eventName, content) {
    const output = {
        hookSpecificOutput: {
            hookEventName: eventName,
            additionalContext: content,
        },
    };
    console.log(JSON.stringify(output));
    process.exit(0);
}
function handleSessionStart(input) {
    const { session_id, cwd, source } = input;
    console.error('[agents-md] handleSessionStart source:', source);
    if (!['startup', 'clear', 'compact'].includes(source)) {
        console.error('[agents-md] Skipping: source not in allowed list');
        process.exit(0);
    }
    const agentsPath = path.join(cwd, 'AGENTS.md');
    console.error('[agents-md] Looking for:', agentsPath);
    if (!fs.existsSync(agentsPath)) {
        console.error('[agents-md] File not found');
        process.exit(0);
    }
    console.error('[agents-md] Found AGENTS.md, reading...');
    if (isAlreadyInjected(session_id, agentsPath)) {
        process.exit(0);
    }
    const content = fs.readFileSync(agentsPath, 'utf-8');
    saveInjectedPath(session_id, agentsPath);
    outputContext('SessionStart', content);
}
function handlePostToolUse(input) {
    const { session_id, cwd, tool_name, tool_input } = input;
    if (tool_name !== 'Read') {
        process.exit(0);
    }
    const filePath = tool_input?.file_path;
    if (!filePath) {
        process.exit(0);
    }
    const agentsPath = findClosestAgentsMd(filePath, cwd);
    if (!agentsPath) {
        process.exit(0);
    }
    if (isAlreadyInjected(session_id, agentsPath)) {
        process.exit(0);
    }
    const content = fs.readFileSync(agentsPath, 'utf-8');
    saveInjectedPath(session_id, agentsPath);
    outputContext('PostToolUse', content);
}
function main() {
    try {
        const stdin = fs.readFileSync(0, 'utf-8');
        console.error('[agents-md] Received input:', stdin.substring(0, 200));
        const input = JSON.parse(stdin);
        console.error('[agents-md] Event:', input.hook_event_name, 'cwd:', input.cwd);
        switch (input.hook_event_name) {
            case 'SessionStart':
                handleSessionStart(input);
                break;
            case 'PostToolUse':
                handlePostToolUse(input);
                break;
            default:
                process.exit(0);
        }
        process.exit(0);
    }
    catch (err) {
        console.error('[agents-md] Error:', err.message);
        process.exit(0);
    }
}
main();
