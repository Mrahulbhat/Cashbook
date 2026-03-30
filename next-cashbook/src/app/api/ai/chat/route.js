import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { messages, context } = await req.json();
        
        // Ensure you have this key in your .env.local file
        const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        if (!API_KEY) {
            return NextResponse.json({ 
                content: "I'm ready to help! However, the AI API key is missing. Please add `GEMINI_API_KEY` to your `.env.local` file to enable my brain." 
            });
        }

        // Prepare the text by combining system prompt and conversation
        let fullConversationText = `System Instructions: You are "Cashbook AI", a sophisticated financial assistant for the Cashbook application. Your goal is to help users manage their money, understand their spending patterns, and provide actionable financial advice.
        
        Current Financial Context for this user:
        - Total Balance: ${context.totalBalance}
        - Number of Accounts: ${context.accountCount}
        - Total Transactions: ${context.transactionCount}
        - Recent Transactions: ${JSON.stringify(context.recentTransactions)}
        
        Guidelines:
        - Be concise, professional, and encouraging.
        - Use bullet points for analysis.
        - ALWAYS caution the user that you are an AI.\n\n`;

        // Prepend context to the last user message
        const conversationHistory = messages.map(msg => 
            `${msg.role === 'assistant' ? 'Model: ' : 'User: '}${msg.content}`
        ).join('\n');

        const finalPrompt = fullConversationText + conversationHistory + "\n\nAssistant:";

        const payload = {
            contents: [{
                parts: [{ text: finalPrompt }]
            }],
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            }
        };

        // Model fallback list with latest variants
        const models = [
            "gemini-1.5-flash-latest", 
            "gemini-1.5-flash", 
            "gemini-1.5-pro-latest", 
            "gemini-1.5-pro", 
            "gemini-pro",
            "gemini-1.5-flash-8b"
        ];
        let aiText = "";
        let success = false;

        for (const model of models) {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    const result = await response.json();
                    aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    if (aiText) {
                        success = true;
                        break;
                    }
                } else {
                    const error = await response.json();
                    console.warn(`Model ${model} failed:`, error.error?.message);
                }
            } catch (err) {
                console.warn(`Model ${model} request error:`, err);
            }
        }

        if (!success) {
            return NextResponse.json({ 
                content: "I'm having trouble accessing my brains currently. Please ensure your API key has 'Generative Language API' enabled and try again in a few minutes." 
            });
        }

        return NextResponse.json({ content: aiText });

    } catch (error) {
        console.error("AI Assistant Error:", error);
        return NextResponse.json({ 
            content: "Oops! My circuits got crossed. Please try again later or check your API key configuration." 
        }, { status: 500 });
    }
}
