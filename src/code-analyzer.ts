import type { FastMCP } from "fastmcp";
import {
  CODE_ANALYSIS_SYSTEM_PROMPT,
  generateAnalysisUserMessage,
} from "./prompts/index.js";
import type { AnalysisResult, CodeFile } from "./types.js";

/**
 * AI-powered code analyzer using MCP sampling
 */
export class CodeAnalyzer {
  private server: FastMCP;

  constructor(server: FastMCP) {
    this.server = server;
  }

  /**
   * Analyze code files using AI via MCP sampling
   */
  async analyze(
    files: CodeFile[],
    prTitle?: string,
    prDescription?: string
  ): Promise<AnalysisResult> {
    // Find an active session that supports sampling
    const session = this.server.sessions.find((s) => s.isReady);

    if (!session) {
      // Return basic metrics if no session available
      return this.getBasicMetrics(files);
    }

    // Check if client supports sampling
    const capabilities = session.clientCapabilities;
    if (!capabilities?.sampling) {
      return this.getBasicMetrics(files);
    }

    try {
      const userMessage = generateAnalysisUserMessage({
        files,
        prTitle,
        prDescription,
      });

      const response = await session.requestSampling(
        {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: userMessage,
              },
            },
          ],
          systemPrompt: CODE_ANALYSIS_SYSTEM_PROMPT,
          maxTokens: 4000,
        },
        {
          timeout: 60000,
          resetTimeoutOnProgress: true,
          maxTotalTimeout: 120000,
        }
      );

      // Parse the JSON response from the LLM
      const responseText =
        response.content.type === "text" ? response.content.text : "";

      return this.parseAnalysisResponse(responseText, files);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("AI analysis failed, using basic metrics:", message);
      return this.getBasicMetrics(files);
    }
  }

  /**
   * Parse the LLM's JSON response into AnalysisResult
   */
  private parseAnalysisResponse(
    responseText: string,
    files: CodeFile[]
  ): AnalysisResult {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim();

      const parsed = JSON.parse(jsonStr);

      // Validate and normalize the response
      return {
        summary: {
          totalFiles: parsed.summary?.totalFiles ?? files.length,
          totalAdditions: files.reduce((sum, f) => sum + f.additions, 0),
          totalDeletions: files.reduce((sum, f) => sum + f.deletions, 0),
          issuesFound: parsed.summary?.issuesFound ?? 0,
          securityIssues: parsed.summary?.securityIssues ?? 0,
        },
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions
          : [],
        assessment: this.normalizeAssessment(parsed.assessment),
      };
    } catch {
      console.error("Failed to parse AI response, using basic metrics");
      return this.getBasicMetrics(files);
    }
  }

  /**
   * Normalize assessment value to valid enum
   */
  private normalizeAssessment(
    assessment: string
  ): AnalysisResult["assessment"] {
    switch (assessment?.toLowerCase()) {
      case "approved":
        return "approved";
      case "requires-changes":
        return "requires-changes";
      default:
        return "needs-work";
    }
  }

  /**
   * Get basic metrics when AI analysis is unavailable
   */
  private getBasicMetrics(files: CodeFile[]): AnalysisResult {
    const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
    const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

    const suggestions: string[] = [];

    if (totalAdditions + totalDeletions > 500) {
      suggestions.push(
        "Large PR detected - consider splitting into smaller changes"
      );
    }

    const hasTests = files.some(
      (f) => f.filename.includes("test") || f.filename.includes("spec")
    );
    if (!hasTests && totalAdditions > 50) {
      suggestions.push("Consider adding tests for these changes");
    }

    return {
      summary: {
        totalFiles: files.length,
        totalAdditions,
        totalDeletions,
        issuesFound: 0,
        securityIssues: 0,
      },
      issues: [],
      suggestions,
      assessment: "needs-work",
    };
  }
}
