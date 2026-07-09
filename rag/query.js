import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import {QdrantVectorStore} from '@langchain/qdrant';
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});


async function query(userQuery){
    //convert user query to vector embeddings
    //Initalize the embedding model
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        apiKey: process.env.GEMINI_API_KEY,
        outputDimensionality: 1536,
    });


    //search the vector in the qdrant
    //The vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings, //Use this embedding model
        {
            url: 'http://localhost:6333',
            collectionName: 'ashaaf-docs',
        }
    );


    //get similar vectors and chunks
    const vectorRetriever = vectorStore.asRetriever({ k: 5 });
    const results = await vectorRetriever.invoke(userQuery);


    //feed those chunk to llm model and do a simple chat with {userQuery}
    const SYSTEM_PROMPT = `
        You are expert in answering user query based on the provided context about document.
        Do not answer anything beyond what is provided.

        Always answer the user in short and tell which page number that content is available and also name of the book.

        User Documents:
        ${results.map(e => JSON.stringify({bookName: e.metadata.source, pageContent: e.pageContent, pageNumber: e.metadata.loc.pageNumber})).join('\n\n')}
    `;

    const llmResponse = await client.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
            {role: 'system', content: SYSTEM_PROMPT},
            {role:'user', content: userQuery},
        ]
    });

    console.log(`LLM Response:`,llmResponse.choices[0].message.content);
}

query('What is Hidden Markovian Models?')
// query('What is Acid Rain?')
