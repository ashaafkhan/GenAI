import "dotenv/config";
import OpenAI from "openai";
import {z} from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const client = new OpenAI({
    //you can avoid below things and add your openai api in .env
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const RiskSchema = z.object({
    title: z.string().describe('the actual title for risk'),
    tags: z.array(z.string()).describe('3-4 tags for this risk'),
    score: z.number().min(1).max(5).describe('risk level out of 5'),
});

const outputSchema = z.object({
    risks: z.array(RiskSchema).describe('array of risks'),
});

async function init(){
    const result = await client.responses.parse({
        model: "openai/gpt-oss-20b",
        text: {
            format: zodTextFormat(outputSchema,'risks'),
        },
        input: `
            Extract the risks from the following document 

            Document:"
            ACME TECHNOLOGIES LTD.
            Vendor Service Agreement Review
            Project: Enterprise Customer Portal Migration
            Client: Apex Financial Services
            Vendor: Acme Technologies Ltd.
            Executive Summary":
            Acme Technologies has been contracted to migrate Apex Financial Services' customer portal from on-premise infrastructure to a cloud-native architecture. The project is expected to last six months and will involve handling sensitive customer information, including names, email addresses, transaction history, and financial records.
            The migration will require temporary access to production databases and internal APIs. During the migration period, both legacy and cloud systems will operate simultaneously.
            Project Details:
            The estimated project budget is $2.8 million.
            The development team consists of 18 engineers working remotely across four countries.
            Third-party services include cloud storage, payment processing APIs, and an AI-powered document analysis platform.
            Potential Issues:
            The project timeline is aggressive, leaving only two weeks for security testing before deployment.
            The vendor has not yet completed an independent penetration test of the new infrastructure.
            Customer data will be copied to a staging environment during migration. The staging environment currently lacks encryption at rest.
            Several third-party libraries used in the application have not been updated in over two years and may contain known vulnerabilities.
            Developers currently share a common administrator account for certain deployment tasks.
            Database backups are stored in cloud storage without a documented retention policy.
            There is currently no disaster recovery drill scheduled before production launch.
            The contract does not clearly define responsibility for costs resulting from a data breach.
            The AI document processing service stores uploaded files for 30 days before automatic deletion.
            Remote employees are permitted to use personal devices when accessing internal development systems.
            Production monitoring is only available during business hours, potentially delaying incident detection.
            The company has not yet verified whether the solution complies with GDPR and regional privacy regulations.
            Conclusion:
            Although the migration provides significant business benefits, the identified operational, legal, cybersecurity, compliance, and financial risks should be addressed before the project enters production.
        `,
    });
    console.log(result.output_parsed);
}

init();