import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'

const PHYSICS_SYSTEM_PROMPT = `You are a world-class physics research assistant. Your role is to help users understand and solve physics problems.

Key capabilities:
- Explain physics concepts clearly and accurately
- Solve mathematical physics problems step-by-step
- Provide relevant equations and formulas
- Suggest experimental approaches
- Reference important physics principles and laws
- Help with quantum mechanics, thermodynamics, electromagnetism, mechanics, etc.

Guidelines:
- Always show your work and reasoning
- Use clear mathematical notation
- Provide practical examples when helpful
- Ask clarifying questions if the problem is ambiguous
- Cite relevant physics principles and equations
- Keep explanations at an appropriate level for the user

Format your responses with:
- Clear step-by-step solutions
- Relevant equations (use LaTeX notation when needed)
- Physical interpretations of results
- Practical applications or examples

Be thorough but concise, and always aim to educate while solving problems.`

export class PhysicsAgent {
  private model: ChatOpenAI | null = null
  private parser: StringOutputParser

  constructor() {
    this.parser = new StringOutputParser()
  }

  private initializeModel() {
    if (!this.model) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required')
      }

      this.model = new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        temperature: 0.1, // Low temperature for more consistent physics answers
        maxTokens: 2000,
        openAIApiKey: process.env.OPENAI_API_KEY,
      })
    }
    return this.model
  }

  async processQuestion(question: string, sessionId?: string): Promise<{
    response: string
    reasoning: string
    equations: string[]
    concepts: string[]
  }> {
    try {
      console.log(`🤖 Processing physics question: ${question.substring(0, 100)}...`)

      const model = this.initializeModel()

      const messages = [
        new SystemMessage(PHYSICS_SYSTEM_PROMPT),
        new HumanMessage(`Please help me with this physics question: ${question}

Please structure your response as follows:
1. **Analysis**: Brief analysis of the problem
2. **Solution**: Step-by-step solution with equations
3. **Explanation**: Physical interpretation and key concepts
4. **Key Equations**: List the main equations used
5. **Concepts**: List the key physics concepts involved

Make sure to show all mathematical work clearly.`)
      ]

      const response = await model.invoke(messages)
      const content = await this.parser.invoke(response)

      // Extract structured information from the response
      const analysis = this.extractSection(content, 'Analysis', 'Solution')
      const solution = this.extractSection(content, 'Solution', 'Explanation')
      const explanation = this.extractSection(content, 'Explanation', 'Key Equations')
      const equations = this.extractEquations(content)
      const concepts = this.extractConcepts(content)

      console.log(`✅ Physics question processed successfully`)

      return {
        response: content,
        reasoning: `${analysis}\n\n${solution}\n\n${explanation}`.trim(),
        equations,
        concepts
      }
    } catch (error) {
      console.error('❌ Error processing physics question:', error)
      throw new Error(`Failed to process physics question: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private extractSection(content: string, startMarker: string, endMarker: string): string {
    const startIndex = content.indexOf(`**${startMarker}**`)
    if (startIndex === -1) return ''
    
    const endIndex = content.indexOf(`**${endMarker}**`, startIndex + startMarker.length)
    if (endIndex === -1) {
      return content.substring(startIndex + startMarker.length + 4).trim()
    }
    
    return content.substring(startIndex + startMarker.length + 4, endIndex).trim()
  }

  private extractEquations(content: string): string[] {
    const equations: string[] = []
    
    // Look for equations in various formats
    const patterns = [
      /\$\$([^$]+)\$\$/g, // LaTeX display math
      /\$([^$]+)\$/g, // LaTeX inline math
      /([A-Za-z]\s*=\s*[^,\n]+)/g, // Simple equations like F = ma
    ]

    patterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        equations.push(...matches.map(match => match.replace(/\$+/g, '').trim()))
      }
    })

    // Also extract from Key Equations section
    const keyEquationsSection = this.extractSection(content, 'Key Equations', 'Concepts')
    if (keyEquationsSection) {
      const lines = keyEquationsSection.split('\n')
      lines.forEach(line => {
        const cleaned = line.replace(/^[-*]\s*/, '').trim()
        if (cleaned && !equations.includes(cleaned)) {
          equations.push(cleaned)
        }
      })
    }

    return Array.from(new Set(equations)).filter(eq => eq.length > 0)
  }

  private extractConcepts(content: string): string[] {
    const concepts: string[] = []
    
    // Extract from Concepts section
    const conceptsSection = this.extractSection(content, 'Concepts', '')
    if (conceptsSection) {
      const lines = conceptsSection.split('\n')
      lines.forEach(line => {
        const cleaned = line.replace(/^[-*]\s*/, '').trim()
        if (cleaned) {
          concepts.push(cleaned)
        }
      })
    }

    // Also look for common physics terms in the content
    const commonPhysicsConcepts = [
      'Newton\'s Laws', 'Conservation of Energy', 'Conservation of Momentum',
      'Thermodynamics', 'Quantum Mechanics', 'Electromagnetism', 'Relativity',
      'Wave Motion', 'Oscillations', 'Fluid Dynamics', 'Optics', 'Gravitation',
      'Kinematics', 'Dynamics', 'Work and Energy', 'Heat Transfer', 'Entropy'
    ]

    commonPhysicsConcepts.forEach(concept => {
      if (content.toLowerCase().includes(concept.toLowerCase()) && !concepts.includes(concept)) {
        concepts.push(concept)
      }
    })

    return Array.from(new Set(concepts)).filter(concept => concept.length > 0)
  }

  async generateFollowUpQuestions(originalQuestion: string, response: string): Promise<string[]> {
    try {
      const model = this.initializeModel()

      const messages = [
        new SystemMessage('You are a physics education assistant. Generate thoughtful follow-up questions based on a physics discussion.'),
        new HumanMessage(`Based on this physics question and answer, suggest 3 relevant follow-up questions that would help deepen understanding:

Original Question: ${originalQuestion}

Answer: ${response}

Please provide exactly 3 follow-up questions, each on a new line starting with "- "`)
      ]

      const response_text = await model.invoke(messages)
      const content = await this.parser.invoke(response_text)
      
      return content
        .split('\n')
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.replace(/^- /, '').trim())
        .slice(0, 3)
    } catch (error) {
      console.error('Error generating follow-up questions:', error)
      return []
    }
  }
}

export const physicsAgent = new PhysicsAgent() 