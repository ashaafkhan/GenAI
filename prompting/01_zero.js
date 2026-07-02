import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});import { OpenAI } from 'openai'

const apiKey = process.env.OPENAI_API_KEY;

const client = new OpenAI({
    apiKey,
});

async function main() {
    const result = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'tell me whats 10+7' }],
    });
    console.log(`Ans from OpenAI API:`,result.choices[0].message.content)
}

main();
