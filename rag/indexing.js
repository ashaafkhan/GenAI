import dotenv from "dotenv";
dotenv.config();

import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf';
// import {OpenAIEmbeddings} from '@langchain/openai';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import {QdrantVectorStore} from '@langchain/qdrant';

async function generateVectorEmbeddingsForFile(filepath) {
    //Load the PDF content as document
    const loader = new PDFLoader(filepath);
    const documents = await loader.load(); //already changes data page by paeg

    //Initalize the embedding model
    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        apiKey: process.env.GEMINI_API_KEY,
        outputDimensionality: 1536,
    });

    //The vector store
    const vectorStore = await QdrantVectorStore.fromDocuments(
        documents,
        embeddings, //Use this embedding model
        {
            url: 'http://localhost:6333',
            collectionName: 'ashaaf-docs',
        }
    );

    // await vectorStore.addDocuments(documents);  
    console.log(`All the document are indexed.....`)
}

generateVectorEmbeddingsForFile('nlp.pdf');

