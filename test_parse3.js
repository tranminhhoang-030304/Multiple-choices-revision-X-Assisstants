const options = ["1", "2", "3", ""];
const answer = "D";
const ansIndex = answer.charCodeAt(0) - 65;
const finalAnswer = options[ansIndex] || answer;
console.log({ansIndex, option3: options[3], finalAnswer});
