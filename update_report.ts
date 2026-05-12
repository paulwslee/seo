import { db } from "./src/lib/db/index.ts";
import { scanResults } from "./src/lib/db/schema.ts";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function fixReport() {
  const scanId = "5dbfb0f3-6fd3-4711-8845-60ca61f199ef";
  console.log("Fetching scan ID:", scanId);
  const scans = await db.select().from(scanResults).where(eq(scanResults.id, scanId)).limit(1);
  if (scans.length === 0) {
    console.log("Scan not found");
    return;
  }
  const s = scans[0];
  
  if (!s.auditJson) {
     console.log("No auditJson found");
     return;
  }
  
  const parsedAudit = JSON.parse(s.auditJson);
  if (parsedAudit.markdown_report) {
     console.log("markdown_report already exists!");
     return;
  }
  
  console.log("Report does not contain markdown_report. Re-generating AI report...");
  const rawEvidenceJson = JSON.stringify({
    crawler_data: {}, 
    psi_data: s.performanceJson ? JSON.parse(s.performanceJson) : null,
    audit_data: parsedAudit
  });
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const prompt = `You are an elite Google Technical SEO and Compliance Consultant.
Analyze the following raw technical data for ${s.url} and write a highly detailed, 15+ page B2B Technical Due Diligence Report in en.
Do NOT restrict yourself to 10 pages. Provide as much exhaustive depth, remediation steps, and security impact analysis as possible.

Output MUST be pure Markdown ONLY. Do NOT wrap it in a JSON object. Do NOT use markdown code blocks like \`\`\`markdown at the start.
IMPORTANT: Do NOT use numbering in your main headings (e.g., do NOT write "01 Executive Summary", just write "Executive Summary"). This will be appended to an existing document.

Raw Data: ${rawEvidenceJson.substring(0, 40000)}`;

  console.log("Calling Gemini API... (This might take 30-60 seconds)");
  try {
    const aiRes = await model.generateContent(prompt);
    let markdownOutput = aiRes.response.text();
    
    // Clean up any potential markdown code block wrappers
    if (markdownOutput.startsWith("```markdown")) {
      markdownOutput = markdownOutput.replace(/^```markdown\n/, "").replace(/\n```$/, "");
    } else if (markdownOutput.startsWith("```")) {
      markdownOutput = markdownOutput.replace(/^```\n/, "").replace(/\n```$/, "");
    }
    
    console.log("Successfully generated markdown report of length", markdownOutput.length);
    const finalAuditJson = JSON.stringify({
      markdown_report: markdownOutput,
      original: parsedAudit
    });
    
    console.log("Updating database...");
    await db.update(scanResults).set({
      auditJson: finalAuditJson,
      evidenceHash: s.evidenceHash || "regenerated-hash"
    }).where(eq(scanResults.id, scanId));
    
    console.log("Database updated successfully! The PDF report will now work.");
  } catch (err) {
    console.error("AI Generation Failed:", err);
  }
}

fixReport();
