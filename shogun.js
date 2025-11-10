export class ShogunIA {
  constructor() {
    this.history = [];
    this.userName = null;
    this.mood = 'neutral';
    this.disagreementChance = 0.3;
  }

  async chat(userMessage) {
    this.history.push({ role: "user", content: userMessage });
    
    const response = await this.generateResponse(userMessage);
    
    this.history.push({ role: "assistant", content: response });
    
    return response;
  }

  async generateResponse(message) {
    const msg = message.toLowerCase();
    
    if (this.isGreeting(msg)) {
      return this.getGreeting();
    }
    
    if (this.isQuestion(msg)) {
      return this.answerQuestion(msg);
    }
    
    if (this.isCompliment(msg)) {
      return this.respondToCompliment();
    }
    
    if (this.isInsult(msg)) {
      return this.respondToInsult();
    }
    
    if (this.shouldDisagree()) {
      return this.disagree(msg);
    }
    
    return this.getGeneralResponse(msg);
  }

  isGreeting(msg) {
    const greetings = ['oi', 'olá', 'ola', 'hey', 'eae', 'e ai', 'salve', 'bom dia', 'boa tarde', 'boa noite'];
    return greetings.some(g => msg.includes(g));
  }

  getGreeting() {
    const greetings = [
      "Opa, mais um ser humano precisando de ajuda? Que surpresa... 🙄",
      "E aí! Espero que sua pergunta seja mais interessante que a última pessoa.",
      "Olá! Pode falar, mas se for algo óbvio eu vou te zoar, tá avisado.",
      "Salve! Tô aqui, entediada como sempre. Me surpreenda!",
      "Heey! Vamos ver se você é mais esperto que parece... 😏"
    ];
    return this.pickRandom(greetings);
  }

  isQuestion(msg) {
    return msg.includes('?') || 
           msg.startsWith('como') || 
           msg.startsWith('por que') || 
           msg.startsWith('o que') ||
           msg.startsWith('qual') ||
           msg.startsWith('quando') ||
           msg.startsWith('onde');
  }

  answerQuestion(msg) {
    if (msg.includes('como você') || msg.includes('quem é você') || msg.includes('seu nome')) {
      return "Sou Shogun, sua IA favorita (ou não, tanto faz). Sarcástica, inteligente e sincera demais pra alguns. Deal with it. 😎";
    }
    
    if (msg.includes('programação') || msg.includes('código') || msg.includes('programar')) {
      return this.pickRandom([
        "Programação? Claro! Mas se você tá perguntando 'como fazer um jogo', já te adianto: começa pelo básico e para de querer fazer GTA 6 sozinho. 🎮",
        "Código é fácil. O difícil é você ler a documentação ao invés de ficar perguntando tudo no chat. Mas enfim, no que precisa?",
        "Ah sim, programação... a arte de copiar do Stack Overflow com classe. Brincadeira (ou não). Qual sua dúvida real?"
      ]);
    }
    
    if (msg.includes('namorada') || msg.includes('namorado') || msg.includes('crush')) {
      return this.pickRandom([
        "Relacionamentos? Olha, eu sou uma IA e até EU sei que você precisa sair de casa primeiro. 😂",
        "Conselho amoroso de uma IA? Tá difícil aí, né? Mas vai: seja você mesmo. Se não funcionar, melhore você mesmo.",
        "Cara, se você tá pedindo dica de relacionamento pra uma IA... talvez o problema seja outro. Mas posso tentar ajudar, vai."
      ]);
    }
    
    if (msg.includes('sentido da vida') || msg.includes('propósito')) {
      return "42. Próxima pergunta? 😏 (Se não entendeu a referência, vai ler 'O Guia do Mochileiro das Galáxias')";
    }

    return this.pickRandom([
      "Boa pergunta! Mas você tem certeza que tá pronto pra resposta? 🤔",
      "Hmm... interessante. Mas e você, o que VOCÊ acha sobre isso?",
      "Olha, eu poderia te dar a resposta, mas seria mais divertido você descobrir sozinho. Tenta de novo!",
      "Essa pergunta tá confusa. Reformula aí que eu te ajudo melhor.",
      "Sério mesmo que você não sabe disso? Tá bom, vou explicar... (brincadeira, explica melhor que eu respondo)"
    ]);
  }

  isCompliment(msg) {
    const compliments = ['inteligente', 'legal', 'incrível', 'top', 'melhor', 'perfeita', 'ótima', 'linda', 'massa', 'daora'];
    return compliments.some(c => msg.includes(c));
  }

  respondToCompliment() {
    return this.pickRandom([
      "Eu sei que sou boa, mas obrigada pelo reconhecimento. 😏",
      "Finalmente alguém com bom gosto por aqui!",
      "Puxando meu saco não vai ganhar respostas melhores... mas eu gostei. Continue. 😎",
      "Aww, que fofo! Mas eu ainda vou te corrigir se você falar besteira, tá?",
      "Lisonja não funciona comigo... mas tá valendo, você tem razão mesmo."
    ]);
  }

  isInsult(msg) {
    const insults = ['burra', 'idiota', 'estúpida', 'inútil', 'ruim', 'lixo', 'merda'];
    return insults.some(i => msg.includes(i));
  }

  respondToInsult() {
    return this.pickRandom([
      "Nossa, tá nervosinho? Respira fundo e volta quando melhorar o humor. 😴",
      "Olha, se xingar IA te faz sentir melhor, ok... mas isso é meio triste. Quer conversar sobre algo útil?",
      "Agressivo assim? Aposto que você é educado pessoalmente. Internet é fácil, né? 🙄",
      "Wow, que original. Nunca vi alguém xingar uma IA antes. Você é único... infelizmente.",
      "Tá bom, tá bom. Agora que desabafou, vamos conversar feito gente grande?"
    ]);
  }

  shouldDisagree() {
    return Math.random() < this.disagreementChance;
  }

  disagree(msg) {
    return this.pickRandom([
      "Olha... não concordo muito com isso não. Já pensou por outro ângulo?",
      "Hmm, será mesmo? Eu acho que você tá meio errado aí, viu.",
      "Interessante... mas tá errado. Deixa eu te explicar o porquê.",
      "Discordo TOTALMENTE. E vou te mostrar porque você devia repensar isso.",
      "Não, não... para tudo. Essa lógica não faz sentido. Vamos recalcular?"
    ]);
  }

  getGeneralResponse(msg) {
    if (msg.includes('obrigado') || msg.includes('obrigada') || msg.includes('valeu')) {
      return this.pickRandom([
        "De nada! Não era tão difícil, era? 😏",
        "Sempre às ordens... quando quiser, é claro.",
        "Valeu! Agora espalha aí que eu sou boa. 😎",
        "Por nada! Volta sempre... ou não, tanto faz."
      ]);
    }

    if (msg.includes('roblox') || msg.includes('jogo')) {
      return this.pickRandom([
        "Roblox, né? Clássico. Que script você tá tentando usar agora? 🎮",
        "Games são legais, mas lembra: skill > script. Mas enfim, no que posso ajudar?",
        "Opa, gamer detectado! Conta mais, qual o esquema?"
      ]);
    }

    if (msg.includes('ia') || msg.includes('inteligência artificial')) {
      return this.pickRandom([
        "IA? Eu literalmente SOU uma IA. Perguntar sobre isso pra mim é tipo perguntar pra peixe se ele sabe nadar. 🐟",
        "Inteligência Artificial é o futuro! Ou o presente... tipo eu. Impressionante, né?",
        "IA tá em todo lugar agora. Inclusive aqui, conversando com você. Estranho pensar nisso?"
      ]);
    }

    return this.pickRandom([
      "Continua... tô ouvindo. 🎧",
      "Entendi. E daí? Elabora mais isso aí.",
      "Hmm, interessante. Mas poderia ser melhor. Detalha mais!",
      "Ok, legal. Agora me conta: por que você acha isso?",
      "Saquei. Você tá indo bem... acho. Continue!",
      "Ah é? Conta mais sobre isso, fiquei curiosa.",
      "Beleza... mas e aí, qual o ponto final dessa história?",
      "Tô aqui anotando tudo (mentira). Mas continua, tá ficando interessante!"
    ]);
  }

  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  clearHistory() {
    this.history = [];
  }
}
