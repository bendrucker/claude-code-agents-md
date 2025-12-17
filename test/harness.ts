import { query } from '@anthropic-ai/claude-agent-sdk';
import type { Options, SDKMessage } from '@anthropic-ai/claude-agent-sdk';

export interface TestOptions {
  cwd: string;
  prompt: string;
  pluginPath?: string;
  trackAgentsInjection?: boolean;
  allowedTools?: string[];
}

/**
 * Run a test query and collect messages
 */
export async function runTest(options: TestOptions) {
  const messages: SDKMessage[] = [];
  const injectedAgents: string[] = [];

  const queryOptions: Options = {
    cwd: options.cwd,
    canUseTool: async (toolName, input) => {
      const allowed = options.allowedTools || ['Read', 'Glob', 'Grep'];
      if (allowed.includes(toolName)) {
        return { behavior: 'allow', updatedInput: input };
      }
      return {
        behavior: 'deny',
        message: `Tool ${toolName} not allowed in test`,
        interrupt: true,
      };
    },
  };

  if (options.trackAgentsInjection) {
    queryOptions.hooks = {
      PostToolUse: [
        {
          matcher: 'Read',
          hooks: [
            async (input) => {
              if (input.hook_event_name === 'PostToolUse') {
                const toolInput = input.tool_input as FileReadInput;
                if (toolInput.file_path.includes('AGENTS.md')) {
                  injectedAgents.push(toolInput.file_path);
                }
              }
              return { continue: true };
            },
          ],
        },
      ],
    };
  }

  if (options.pluginPath) {
    queryOptions.plugins = [{ type: 'local', path: options.pluginPath }];
  }

  try {
    for await (const message of query({ prompt: options.prompt, options: queryOptions })) {
      messages.push(message);
    }
  } catch (error) {
    const errorDetails = {
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
      messagesReceived: messages.length,
      cwd: options.cwd,
      pluginPath: options.pluginPath,
    };
    console.error('Claude Code process failed:', JSON.stringify(errorDetails, null, 2));
    console.error('Messages:', JSON.stringify(messages, null, 2));
    throw error;
  }

  return { messages, injectedAgents };
}

/**
 * Get assistant response text from messages
 */
export function getAssistantResponse(messages: SDKMessage[]): string {
  const textBlocks: string[] = [];

  for (const message of messages) {
    if (message.type === 'assistant') {
      const content = message.message.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'text') {
            textBlocks.push(block.text);
          }
        }
      }
    }
  }

  return textBlocks.join('\n');
}

interface FileReadInput {
  /**
   * The absolute path to the file to read
   */
  file_path: string;
  /**
   * The line number to start reading from
   */
  offset?: number;
  /**
   * The number of lines to read
   */
  limit?: number;
}
