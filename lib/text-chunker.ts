import * as fs from 'fs';
import * as path from 'path';

export interface Chunk {
  id: string;
  content: string;
  question?: string;
  answer?: string;
  metadata: {
    source: string;
    chunkIndex: number;
    totalChunks: number;
    category?: string;
  };
}

export class TextChunker {
  async chunkAvenData(): Promise<Chunk[]> {
    const dataPath = path.join(process.cwd(), 'aven-data.txt');
    const content = fs.readFileSync(dataPath, 'utf-8');
    
    // Split content into Q&A pairs
    const qaPairs = this.extractQAPairs(content);
    
    const chunks: Chunk[] = [];
    let chunkIndex = 0;

    for (const pair of qaPairs) {
      if (pair.question && pair.answer) {
        const chunk: Chunk = {
          id: `chunk_${chunkIndex}`,
          content: `${pair.question}\n\n${pair.answer}`,
          question: pair.question,
          answer: pair.answer,
          metadata: {
            source: 'aven-data.txt',
            chunkIndex,
            totalChunks: qaPairs.length,
            category: this.categorizeQuestion(pair.question),
          },
        };
        chunks.push(chunk);
        chunkIndex++;
      }
    }

    return chunks;
  }

  private extractQAPairs(content: string): Array<{ question?: string; answer?: string }> {
    const lines = content.split('\n');
    const pairs: Array<{ question?: string; answer?: string }> = [];
    let currentQuestion = '';
    let currentAnswer = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        // Empty line - save current Q&A pair if we have one
        if (currentQuestion && currentAnswer) {
          pairs.push({
            question: currentQuestion.trim(),
            answer: currentAnswer.trim(),
          });
          currentQuestion = '';
          currentAnswer = '';
        }
        continue;
      }

      // Check if this line looks like a question
      const isQuestion = this.isQuestionLine(trimmedLine, i, lines);
      
      if (isQuestion) {
        // Save previous Q&A pair if we have one
        if (currentQuestion && currentAnswer) {
          pairs.push({
            question: currentQuestion.trim(),
            answer: currentAnswer.trim(),
          });
        }
        currentQuestion = trimmedLine;
        currentAnswer = '';
      } else {
        // This is part of the answer
        if (currentQuestion) {
          currentAnswer += (currentAnswer ? '\n' : '') + trimmedLine;
        }
      }
    }

    // Don't forget the last pair
    if (currentQuestion && currentAnswer) {
      pairs.push({
        question: currentQuestion.trim(),
        answer: currentAnswer.trim(),
      });
    }

    return pairs;
  }

  private isQuestionLine(line: string, lineIndex: number, allLines: string[]): boolean {
    // Check if line ends with question mark
    if (line.endsWith('?')) {
      return true;
    }

    // Check if line looks like a question but is missing the question mark
    const questionPatterns = [
      /^Do mortgage payments have to be current$/i,
      /^What is an Interspousal Transfer Deed$/i,
      /^How to Contact Us$/i,
      /^Why did I recieve a Form 1099-MISC from Aven$/i,
      /^"I received a card in the mail after canceling my account within the rescission period\. Should I be concerned$/i,
    ];

    for (const pattern of questionPatterns) {
      if (pattern.test(line)) {
        return true;
      }
    }

    // Check if line starts with common question words and the next line is an answer
    const questionWords = [
      'what', 'how', 'why', 'when', 'where', 'who', 'which', 'do', 'does', 'can', 'will', 'is', 'are', 'does', 'did'
    ];
    
    const lowerLine = line.toLowerCase();
    const startsWithQuestionWord = questionWords.some(word => lowerLine.startsWith(word));
    
    if (startsWithQuestionWord) {
      // Check if the next non-empty line looks like an answer
      for (let i = lineIndex + 1; i < allLines.length; i++) {
        const nextLine = allLines[i].trim();
        if (nextLine && !this.isQuestionLine(nextLine, i, allLines)) {
          return true;
        }
        if (nextLine && this.isQuestionLine(nextLine, i, allLines)) {
          break;
        }
      }
    }

    return false;
  }

  private categorizeQuestion(question: string): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('fee') || lowerQuestion.includes('cost') || lowerQuestion.includes('charge')) {
      return 'fees';
    }
    if (lowerQuestion.includes('rate') || lowerQuestion.includes('apr') || lowerQuestion.includes('interest')) {
      return 'rates';
    }
    if (lowerQuestion.includes('apply') || lowerQuestion.includes('eligibility') || lowerQuestion.includes('qualify')) {
      return 'application';
    }
    if (lowerQuestion.includes('payment') || lowerQuestion.includes('pay') || lowerQuestion.includes('due')) {
      return 'payments';
    }
    if (lowerQuestion.includes('card') || lowerQuestion.includes('credit') || lowerQuestion.includes('limit')) {
      return 'card_features';
    }
    if (lowerQuestion.includes('home') || lowerQuestion.includes('property') || lowerQuestion.includes('equity')) {
      return 'home_equity';
    }
    if (lowerQuestion.includes('debt') || lowerQuestion.includes('protection') || lowerQuestion.includes('insurance')) {
      return 'debt_protection';
    }
    if (lowerQuestion.includes('close') || lowerQuestion.includes('cancel') || lowerQuestion.includes('refinance')) {
      return 'account_management';
    }
    
    return 'general';
  }
} 