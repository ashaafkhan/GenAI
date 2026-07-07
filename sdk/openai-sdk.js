import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
    //you can avoid below things and add your openai api in .env
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

async function init(){
    const result = await client.responses.create({
        model: "llama-3.1-8b-instant",
        input: "Hie there, My name is Ashaaf Khan.",
    });
    console.log(result.output_text);
}

init();