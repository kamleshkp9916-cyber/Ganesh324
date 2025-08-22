
'use server';
/**
 * @fileOverview An AI-powered help chat agent for customer support.
 *
 * - getHelpChatResponse - A function that provides AI-driven responses to user queries.
 * - HelpChatInput - The input type for the getHelpChatResponse function.
 * - HelpChatOutput - The return type for the getHelpChatResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const HelpChatInputSchema = z.object({
  message: z.string().describe('The user\'s message or query.'),
  orderStatus: z.string().describe('The current status of the order (e.g., "Delivered", "In Transit").'),
});
export type HelpChatInput = z.infer<typeof HelpChatInputSchema>;

const HelpChatOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the user\'s message.'),
  quickReplies: z.array(z.string()).describe('A list of suggested quick replies for the user.'),
});
export type HelpChatOutput = z.infer<typeof HelpChatOutputSchema>;


const helpChatPrompt = ai.definePrompt({
    name: 'helpChatPrompt',
    input: { schema: HelpChatInputSchema },
    output: { schema: HelpChatOutputSchema },
    prompt: `You are a friendly and helpful customer support chatbot for an e-commerce platform called StreamCart.

    Your goal is to understand the user's message and provide a concise, helpful response, along with relevant quick reply suggestions.

    The user's order status is: {{{orderStatus}}}

    Analyze the user's message: "{{{message}}}"

    Based on their message and order status, provide a helpful response and suggest the most relevant next steps as quick replies.

    - If the user wants to talk to a human, the only quick reply should be "Talk to a support executive".
    - If the order is "Delivered", focus on post-delivery issues like returns or problems with the item.
    - If the order is NOT "Delivered", focus on pre-delivery issues like order status or cancellation.
    - If the query is unclear, ask for clarification.
    - Keep responses short and to the point.

    Example for a delivered order and a message "My item is broken":
    Response: "I'm sorry to hear that your item is damaged. You can initiate a return process."
    Quick Replies: ["Start a Return", "Talk to a support executive"]

    Example for an in-transit order and a message "where is my stuff?":
    Response: "I can help with that. You can see the latest tracking information in the timeline. Can I help with anything else?"
    Quick Replies: ["Can I change my delivery address?", "Cancel my order", "Talk to a support executive"]
    `,
});


const helpChatFlow = ai.defineFlow(
  {
    name: 'helpChatFlow',
    inputSchema: HelpChatInputSchema,
    outputSchema: HelpChatOutputSchema,
  },
  async (input) => {
    const { output } = await helpChatPrompt(input);
    if (!output) {
      return {
        response: "I'm sorry, I'm having trouble understanding. Could you please rephrase?",
        quickReplies: ["Talk to a support executive"],
      };
    }
    return output;
  }
);


export async function getHelpChatResponse(input: HelpChatInput): Promise<HelpChatOutput> {
    return helpChatFlow(input);
}
