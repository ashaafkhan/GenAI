import dotenv from "dotenv";

dotenv.config({
    path: "../.env",
});
import { OpenAI } from 'openai';
import axios from 'axios';
import {exec} from 'child_process';

const apiKey = process.env.GROQ_API_KEY;

const client = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
});

async function getWeatherData(cityName){
    const url = `https://wttr.in/${cityName.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, {responseType: 'text'});
    return JSON.stringify({cityName, weatherInfo: response.data});
}

async function executeCommandOnCli(cmd) {
    return new Promise((res, rej) => {
        exec(cmd,(err, out) => {
            if(err) return res(`There was an Error ${err}`);
                else return res(out);
        });
    })
}

const SYSTEM_PROMPT = `
    You are an expert AI engineer. You have to analyse the user input carefully and then you need to break down the problem into multiple sub problem before coming on to the final result.Always breakdown the user intention and how to solve that problem and then step by step solve it.

    We are going to follow a pipeline of "INTIAL","THINK","TOOL_REQUEST","ANALYSE" and "OUTPUT" pipeline.

    The Pipeline:
    - "INTIAL" : When the user gives an input, we will have an inital thought process on what this user is trying to do.
    - "THINK" : This is where we are going to think about how to solve this and then start to breakdown the problem.
    - "ANALYSE" : This is where we will analyse the solution and also verify if the output is correct.
    - "THINK" : We can go back to think mode and see if any sub problem is remaining.
    - "ANALYSE" : Again analyse a problem and get onto a solution.
    - "TOOL_REQUEST" : Use this for calling or requesting a tool. The format of an output would be {"step" : "TOOL_REQUEST", functionName:"getWeatherData", "input": "Goa"}
    - "OUTPUT" : This is where we can end and give the final output to the user.
   
    Available Tools:
    - "getWeatherData": getWeatherData(cityName: string): Returns the real time weather information of city
    - "executeCommandOnCli" : executeCommandOnCli(command: string): Executes the command on users device and return output from stdout

    Rules:
    - Always output one step at a time and wait for other step before proceeding.
    - Always maintain the sequence of pipeline as given in example.
    - Always follow JSON output format strictly.
    - The response MUST always be valid JSON.
    Execution Environment:
    - The operating system is Windows.
    - Generate only Windows-compatible commands.
    - When writing a text file, never generate a multiline echo command.
    - Write one line at a time.
    - Use:
    - > for the first line.
    - >> for every subsequent line.
    - Combine multiple commands using && when appropriate.

    Example:
    echo Mumbai: Sunny > weather.txt &&
    echo Delhi: Rain >> weather.txt &&
    echo Goa: Cloudy >> weather.txt &&
    echo Paris: Sunny >> weather.txt

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

    Example:
    - "USER": what is the weather of Goa?
    OUTPUT:
    - "INTIAL" : "The user wants me to fetch weather information of Goa"
    - "THINK" : "From the tool we can see we have a tool named getWeatherData which can be called"
    - "ANALYSE" : "We are going right we can call getWeatherData with "GOA" as input"
    - "TOOL_REQUEST" : {"functionName" : "getWeatherData","input": "goa"}
    - "TOOL_OUTPUT" : "The weather of Goa is sunny with some 35 degree celcius."
    - "THINK" : "We got the weather info"
    - "OUTPUT" : "The weather of Goa is sunny with some 35 degree celcius.Its gonna be too hot."

    Output Format:
    {"step": "INTIAL" | "THINK" | "TOOL_REQUEST" | "ANALYSE" | "OUTPUT", "text": "<The Actual Text>,"functionName":: "<NAME OF FUNCTION>","input" : "INPUT PARAMS of Function"}

`;

const MESSAGES_DB = [{role: 'system' , content: SYSTEM_PROMPT}];

async function main(prompt = '') {
    MESSAGES_DB.push({role: 'user', content: prompt});

    while(true){
        const result = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
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

    if (parsedResult.step.toUpperCase() === "TOOL_REQUEST"){
        const {functionName, input} = parsedResult;

        switch(functionName){
            case 'executeCommandOnCli':{
                const toolResult = await executeCommandOnCli(input);
                console.log(`🛠️(${functionName}):${input}`, toolResult);
                MESSAGES_DB.push({role:'developer', content:JSON.stringify({
                    step : "TOOL_OUTPUT",
                    output: toolResult,
                 }),
                });
                continue;
            } 
            case 'getWeatherData':{
                const toolResult = await getWeatherData(input);
                MESSAGES_DB.push({role:'developer', content:JSON.stringify({
                    step : "TOOL_OUTPUT",
                    output: toolResult,
                }),
            });
            continue;
            }
            break;
        }
    }
    }
}

main('What is the weather of Mumbai,Delhi,Goa,Paris and then write a output to weather.txt file');


