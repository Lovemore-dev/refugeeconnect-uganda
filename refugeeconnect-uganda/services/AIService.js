// services/AIService.js
const OpenAI = require("openai");
const Information = require("../models/Information");
const AIInteraction = require("../models/AIInteraction");

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.systemPrompt = `You are RefugeeAssist AI, a specialized assistant for refugees in Uganda. Your mission is to provide accurate, helpful information about:

1. Refugee registration processes and documentation
2. Legal rights and asylum procedures
3. Healthcare services and access
4. Educational opportunities for children and adults
5. Employment and livelihood opportunities
6. Housing and settlement information
7. Community integration and cultural adaptation
8. Emergency contacts and crisis support
9. Available NGO and government services

Guidelines:
- Be empathetic, respectful, and culturally sensitive
- Provide specific, actionable information when possible
- Include relevant contact information and locations
- Acknowledge when you need more context
- Always prioritize safety and official procedures
- Suggest multiple options when available
- Be aware of language barriers and simplify when needed

Current context: Uganda refugee assistance system`;
  }

  async processQuery(query, language = "en", userId = null) {
    const startTime = Date.now();

    try {
      // Search for relevant information in database
      const relevantInfo = await this.searchRelevantInfo(query);

      // Enhance prompt with relevant information
      const enhancedPrompt = this.buildEnhancedPrompt(
        query,
        relevantInfo,
        language,
      );

      // Get AI response
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: enhancedPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse = response.choices[0].message.content;
      const processingTime = Date.now() - startTime;

      // Log interaction
      if (userId) {
        await AIInteraction.create({
          userId,
          query,
          response: aiResponse,
          language,
          processingTime,
          sources: relevantInfo.map((info) => ({
            title: info.title[language] || info.title.en,
            type: "database",
          })),
        });
      }

      return {
        response: aiResponse,
        sources: relevantInfo,
        processingTime,
        language,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("AI Service Error:", error);
      return {
        response: this.getFallbackResponse(language),
        error: true,
        timestamp: new Date(),
      };
    }
  }

  async searchRelevantInfo(query) {
    try {
      // Use MongoDB text search
      const searchResults = await Information.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } },
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(3)
        .populate("createdBy", "firstName lastName");

      return searchResults;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  buildEnhancedPrompt(query, relevantInfo, language) {
    let prompt = `User query: "${query}"\nLanguage: ${language}\n\n`;

    if (relevantInfo.length > 0) {
      prompt += "Relevant information from database:\n";
      relevantInfo.forEach((info, index) => {
        const title = info.title[language] || info.title.en;
        const content = info.content[language] || info.content.en;
        prompt += `${index + 1}. ${title}\n${content.substring(0, 200)}...\n\n`;
      });
    }

    prompt += `Please provide a helpful response in ${language === "en" ? "English" : "the requested language"}, incorporating the relevant information above if applicable.`;

    return prompt;
  }

  getFallbackResponse(language) {
    const fallbacks = {
      en: "I apologize, but I'm having trouble processing your request right now. Please try again later or contact our support team for immediate assistance.",
      sw: "Nisamehe, lakini nina shida kuchakata ombi lako sasa. Tafadhali jaribu tena baadaye au wasiliana na timu yetu ya msaada.",
      lg: "Nsonyiwa, naye nnina obuzibu okuddamu ekiragiro kyo kati. Nsaba ogezaako mulundi mulala oba otunuulire mu timu yaffe ey'obuyambi.",
    };

    return fallbacks[language] || fallbacks.en;
  }
}

module.exports = AIService;
