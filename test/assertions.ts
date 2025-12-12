import type { SDKMessage } from '@anthropic-ai/claude-agent-sdk';

/**
 * Assert that hook executed by checking for specific context injection
 */
export function assertHookExecuted(
  messages: SDKMessage[],
  hookName: string
): void {
  const hookMessages = messages.filter(
    (m) => m.type === 'system' && m.subtype === 'hook_response' && m.hook_name === hookName
  );

  if (hookMessages.length === 0) {
    throw new Error(`Hook ${hookName} was not executed`);
  }
}

/**
 * Assert that AGENTS.md content was injected
 */
export function assertContextInjected(
  injectedAgents: string[],
  expectedPath: string
): void {
  const found = injectedAgents.some((path) => path.includes(expectedPath));

  if (!found) {
    throw new Error(
      `AGENTS.md not injected from ${expectedPath}. Injected: ${injectedAgents.join(', ')}`
    );
  }
}

/**
 * Assert that response contains specific text
 */
export function assertResponseContains(
  response: string,
  text: string
): void {
  if (!response.includes(text)) {
    throw new Error(
      `Response does not contain "${text}". Response: ${response.substring(0, 200)}...`
    );
  }
}

/**
 * Assert that a specific tool was used
 */
export function assertToolUsed(
  messages: SDKMessage[],
  toolName: string
): void {
  for (const message of messages) {
    if (message.type === 'assistant') {
      const content = message.message.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'tool_use' && block.name === toolName) {
            return;
          }
        }
      }
    }
  }

  throw new Error(`Tool ${toolName} was not used`);
}
