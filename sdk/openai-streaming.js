import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
    //you can avoid below things and add your openai api in .env
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

async function init(){
    const stream = await client.responses.create({
        model: "openai/gpt-oss-20b",
        input: [
            {
                "role": "user",
                "content": "Tell me story and summary of little red riding hood.",
            },
        ],
        stream: true,
    });
    for await(const event of stream){
        if(event && event.delta) process.stdout.write(event.delta);
    }
}

init();