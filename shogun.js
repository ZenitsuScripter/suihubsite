export class ShogunIA {
  constructor() {
    this.history = [];
  }

  async chat(userMessage) {
    this.history.push({ role: "user", content: userMessage });
    
    const responses = [
      "Interessante... conte-me mais sobre isso.",
      "Entendo. Como posso ajudá-lo com isso?",
      "Hmm, deixe-me pensar sobre isso.",
      "Essa é uma ótima questão!",
      "Vejo que você está interessado nisso."
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    this.history.push({ role: "assistant", content: response });
    
    return response;
  }

  clearHistory() {
    this.history = [];
  }
}
