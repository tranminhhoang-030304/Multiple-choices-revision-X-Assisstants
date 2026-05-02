import fs from 'fs';

const parseTextToQuestions = (text) => {
  const blocks = text.split('---').map(b => b.trim()).filter(b => b.length > 10);
  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    let question = '';
    let options = [];
    let answer = '';
    let explanation = '';
    
    lines.forEach(line => {
      if (line.startsWith('Q:')) question = line.substring(2).trim();
      else if (line.match(/^[A-D]:/)) options.push(line.substring(2).trim());
      else if (line.startsWith('ANSWER:')) answer = line.substring(7).trim();
      else if (line.startsWith('EXPLANATION:')) explanation = line.substring(12).trim();
    });
    
    const ansIndex = answer.charCodeAt(0) - 65;
    const finalAnswer = options[ansIndex] || answer;

    if (!question || options.length === 0) {
      throw new Error('Một câu hỏi trong file text không đúng định dạng Q: và A: B: C:');
    }

    return { question, options, answer: finalAnswer, explanation: explanation || "Không có giải thích chi tiết." };
  });
};

const text1 = `
Q: Test?
A: 1
B: 2
C: 3
ANSWER: D
`;

console.log(parseTextToQuestions(text1));
