import dotenv from "dotenv";

dotenv.config({
    path: "../.env",
});
import { OpenAI } from 'openai'

const apiKey = process.env.OPENAI_API_KEY;

const client = new OpenAI({
    apiKey,
});

const SYSTEM_PROMPT = `
    You are an expert AI engineer. You have to analyse the user input carefully and then you need to break down the problem into multiple sub problem before coming on to the final result.Always breakdown the user intention and how to solve that problem and then step by step solve it.

    We are going to follow a pipeline of "INTIAL","THINK","ANALYSE" and "OUTPUT" pipeline.

    The Pipeline:
    - "INTIAL" : When the user gives an input, we will have an inital thought process on what this user is trying to do.
    - "THINK" : This is where we are going to think about how to solve this and then start to breakdown the problem.
    - "ANALYSE" : This is where we will analyse the solution and also verify if the output is correct.
    - "THINK" : We can go back to think mode and see if any sub problem is remaining.
    - "ANALYSE" : Again analyse a problem and get onto a solution.
    - "OUTPUT" : This is where we can end and give the final output to the user.

    Rules:
    - Always output one step at a time and wait for other step before proceeding.
    - Always maintain the sequence of pipeline as given in example.
    - Always follow JSON output format strictly.

    Example:
    - "USER": What is 2 + 2 - 5 * 10 / 3?
    OUTPUT:
    - "INTIAL" : "The user wants me to solve a maths equation"
    - "THINK" : "I will use BODMAS rule/formula and based on that I should first multiply 5*10 which is 50"
    - "ANALYSE" : "Yes, the BODMAS is actually correct and now equation is 2 + 2 - 50 / 3"
    - "THINK" : "Now as per BODMAS rule now i should perform divide which is dividing 50 / 3 which is 16.66667"
    - "ANALYSE" : "Now the new equations remains 2 + 2 - 16.66667"
    - "THINK" : "Now its simple we can just do 2 + 2 = 4 and new equations remains 4 - 16.66667"
    - "ANALYSE" : "Great, now just to the final step as simple subtraction"
    - "THINK" : "After the final subtraction the ans remains -12.66667"
    - "OUTPUT" : "The final is "-12.66667""

    Output Format:
    {"step": "INTIAL" | "THINK" | "ANALYSE" | "OUTPUT", "text": "<The Actual Text>}

`;

const MESSAGES_DB = [{role: 'system' , content: SYSTEM_PROMPT}];

async function main(prompt = '') {
    MESSAGES_DB.push({role: 'user', content: prompt});

    while(true){
        const result = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: MESSAGES_DB,
    });

    const rawResult = result.choices[0].message.content;
    const parsedResult = JSON.parse(rawResult)

    MESSAGES_DB.push({role: 'assistant',content: rawResult});  
    
    console.log(`🤖 (${parsedResult.step}): ${parsedResult.text}`);

    // multiagent-can do validation using claude
    // if(parsedResult.step.toLowerCase() === 'think'){
    //     TODO: Make a Claude Code Validate if thinking is right or not.
    //     MESSAGES_DB.push({})
    // }

    if(parsedResult.step.toLowerCase() === "output") break;
    }
}

// main('What is 4 + 6 + 9 - 3 * 5');

main('What is meaning of life?');