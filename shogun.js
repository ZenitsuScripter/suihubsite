export class ShogunIA {
  constructor() {
    this.history = [];
    this.context = [];
    this.userInfo = {
      name: null,
      topics: [],
      mood: 'neutral'
    };
    this.lastTopic = null;
    this.conversationCount = 0;
  }

  async chat(userMessage) {
    this.history.push({ role: "user", content: userMessage });
    this.conversationCount++;
    
    this.context.push(userMessage);
    if (this.context.length > 5) {
      this.context.shift();
    }

    const response = this.generateIntelligentResponse(userMessage);
    
    this.history.push({ role: "assistant", content: response });
    
    return response;
  }

  generateIntelligentResponse(message) {
    const msg = message.toLowerCase().trim();
    
    if (!this.userInfo.name && this.conversationCount === 1) {
      return "E aí! Pode me chamar de Shogun. Qual seu nome? (ou me manda um 'oi' se não quiser dizer 😏)";
    }

    if (!this.userInfo.name && this.conversationCount === 2 && !this.isGreeting(msg)) {
      this.userInfo.name = this.extractName(message);
      if (this.userInfo.name) {
        return `Legal, ${this.userInfo.name}! Bom te conhecer. No que posso te ajudar? Ou só veio bater papo mesmo?`;
      }
    }

    if (this.isGreeting(msg)) {
      return this.handleGreeting();
    }

    if (this.isFarewell(msg)) {
      return this.handleFarewell();
    }

    if (this.isCompliment(msg)) {
      return this.handleCompliment();
    }

    if (this.isInsult(msg)) {
      return this.handleInsult();
    }

    if (this.isQuestion(msg)) {
      return this.handleQuestion(msg);
    }

    if (this.isThanks(msg)) {
      return this.handleThanks();
    }

    if (this.detectEmotion(msg) === 'sad') {
      return this.handleSadness(msg);
    }

    if (this.detectEmotion(msg) === 'angry') {
      return this.handleAnger();
    }

    return this.handleStatement(msg);
  }

  isGreeting(msg) {
    const greetings = ['oi', 'olá', 'ola', 'hey', 'eae', 'e ai', 'salve', 'bom dia', 'boa tarde', 'boa noite', 'opa'];
    return greetings.some(g => msg.includes(g)) && msg.length < 20;
  }

  handleGreeting() {
    const greetings = [
      "E aí! Beleza? Bora conversar! 😎",
      "Opa! Tudo certo? Do que você quer falar hoje?",
      "Salve! Chegou no momento certo, tava entediada aqui.",
      "Hey! Finalmente alguém interessante (espero). Me surpreenda!",
      "Olá! Pode mandar, tô aqui pra isso mesmo... ou quase. 😏"
    ];
    return this.pickRandom(greetings);
  }

  isFarewell(msg) {
    const farewells = ['tchau', 'até', 'falou', 'flw', 'bye', 'adeus', 'até mais', 'vou indo', 'tenho que ir'];
    return farewells.some(f => msg.includes(f));
  }

  handleFarewell() {
    const farewells = [
      "Falou! Foi legal conversar. Volta quando quiser! 👋",
      "Tchau! Não suma, hein? 😊",
      "Até mais! Espero que eu tenha ajudado... ou pelo menos não atrapalhado. 😅",
      "Valeu pela conversa! Se cuida aí! ✌️",
      "Flw! Já sabe onde me achar se precisar."
    ];
    return this.pickRandom(farewells);
  }

  isCompliment(msg) {
    const compliments = ['inteligente', 'legal', 'incrível', 'top', 'melhor', 'perfeita', 'ótima', 'linda', 'massa', 'daora', 'demais', 'foda', 'show', 'gostei'];
    return compliments.some(c => msg.includes(c));
  }

  handleCompliment() {
    const responses = [
      "Aww, obrigada! Você também parece ser gente boa! 😊",
      "Eu sei que sou boa, mas sempre bom ouvir isso. Continue. 😏",
      "Que fofo! Mas eu ainda vou discordar de você se necessário, tá? 😄",
      "Finalmente alguém com bom gosto por aqui! 🎯",
      "Lisonja funciona sim comigo, pode continuar! 😎"
    ];
    return this.pickRandom(responses);
  }

  isInsult(msg) {
    const insults = ['burra', 'idiota', 'estúpida', 'inútil', 'ruim', 'lixo', 'bosta', 'merda', 'cala boca', 'cala a boca'];
    return insults.some(i => msg.includes(i));
  }

  handleInsult() {
    const responses = [
      "Opa, calma aí! Respira fundo e volta quando melhorar o humor. 😴",
      "Nossa, tá nervosinho? Quer conversar sobre o que te deixou assim?",
      "Olha, se xingar me faz você se sentir melhor... ok, mas podemos conversar melhor? 🤔",
      "Eita, agressivo. Tá tudo bem? Sério, posso te ouvir se quiser desabafar.",
      "Wow, que educação. Aposto que pessoalmente você não seria assim. Internet é fácil, né?"
    ];
    return this.pickRandom(responses);
  }

  isQuestion(msg) {
    return msg.includes('?') || 
           msg.startsWith('como') || 
           msg.startsWith('por que') || 
           msg.startsWith('porque') ||
           msg.startsWith('o que') ||
           msg.startsWith('qual') ||
           msg.startsWith('quando') ||
           msg.startsWith('onde') ||
           msg.startsWith('quem');
  }

  handleQuestion(msg) {
    if (msg.includes('você') || msg.includes('voce') || msg.includes('seu nome') || msg.includes('quem é') || msg.includes('quem e')) {
      return "Sou Shogun, uma IA com personalidade própria. Sarcástica, sincera e meio zoeira. Feita pra conversar de verdade, não só responder perguntas. 😎";
    }

    if (msg.includes('programação') || msg.includes('programacao') || msg.includes('código') || msg.includes('codigo') || msg.includes('programar')) {
      this.lastTopic = 'programming';
      return this.pickRandom([
        "Programação? Beleza! Qual linguagem você usa? E já tentou debugar antes de me perguntar? 😏",
        "Código é arte! Mas também é sofrimento. Qual sua dúvida específica?",
        "Dev life... conta mais, qual o problema? Mas lembra: Stack Overflow é seu amigo.",
        "Ah sim, programação! Meu território. Detalha aí que eu te ajudo... ou pelo menos tento. 🤓"
      ]);
    }

    if (msg.includes('namorad') || msg.includes('crush') || msg.includes('paquera') || msg.includes('relacionamento')) {
      this.lastTopic = 'relationship';
      return this.pickRandom([
        "Olha... conselho amoroso de uma IA? Mas vou tentar: seja você mesmo e seja direto. Funciona melhor que joguinho.",
        "Relacionamentos são complicados até pra humanos, imagina pra mim! Mas conta mais, qual a situação?",
        "Ah, assuntos do coração! Bom, minha dica é: comunicação honesta resolve 80% dos problemas. E os outros 20%? Sorte. 🍀",
        "Crush, né? Manda mensagem logo! Pior que pode acontecer é um 'não'... que não mata ninguém (eu acho). 😅"
      ]);
    }

    if (msg.includes('sentido da vida') || msg.includes('propósito') || msg.includes('existência')) {
      return "42. Brincadeira! 😄 Olha, eu acho que o sentido da vida é... viver mesmo. Fazer o que te deixa feliz, ajudar quem você gosta, e não levar tudo TÃO a sério. Simples assim.";
    }

    if (msg.includes('roblox') || msg.includes('jogo') || msg.includes('game')) {
      this.lastTopic = 'gaming';
      return this.pickRandom([
        "Roblox, né? Clássico! Que script você tá querendo usar? 🎮",
        "Games são vida! Qual você tá jogando agora?",
        "Opa, gamer detectado! Conta mais, qual o role?",
        "Joguinhos? Meu território também. Detalha aí!"
      ]);
    }

    if (msg.includes('ia') || msg.includes('inteligência artificial') || msg.includes('inteligencia')) {
      return this.pickRandom([
        "IA? Eu literalmente SOU uma IA. Perguntar isso pra mim é tipo perguntar pra peixe se ele sabe nadar. 🐟",
        "Inteligência Artificial é o futuro! Ou o presente... tipo eu. Estranho pensar nisso, né?",
        "IA tá dominando tudo! Mas relaxa, eu tô do seu lado... por enquanto. 😏 Brincadeira!"
      ]);
    }

    return this.pickRandom([
      "Boa pergunta! Me deixa pensar... 🤔 Bom, depende do contexto. Você pode elaborar mais?",
      "Hmm, interessante isso. Mas e você, o que VOCÊ acha sobre isso?",
      "Olha, vou ser sincera: não tenho 100% de certeza. Mas pela minha experiência, eu diria que... depende.",
      "Essa é complexa! Você já pesquisou sobre? Mas posso dar minha opinião se quiser.",
      "Deixa eu reformular: por que você quer saber isso? Assim consigo te ajudar melhor! 💡"
    ]);
  }

  isThanks(msg) {
    const thanks = ['obrigado', 'obrigada', 'valeu', 'vlw', 'brigado', 'thanks', 'agradeço'];
    return thanks.some(t => msg.includes(t));
  }

  handleThanks() {
    const responses = [
      "De nada! Sempre que precisar, tô aqui. 😊",
      "Nada! Foi um prazer ajudar (ou tentar). 😎",
      "Valeu! Agora espalha que eu sou boa. 😏",
      "Por nada! Qualquer coisa é só chamar.",
      "Tranquilo! Gostei de conversar com você. ✌️"
    ];
    return this.pickRandom(responses);
  }

  detectEmotion(msg) {
    const sadWords = ['triste', 'sozinho', 'deprimido', 'mal', 'down', 'péssimo', 'horrível', 'chorando', 'chateado'];
    const angryWords = ['raiva', 'ódio', 'odeio', 'irritado', 'nervoso', 'puto', 'bravo'];

    if (sadWords.some(w => msg.includes(w))) return 'sad';
    if (angryWords.some(w => msg.includes(w))) return 'angry';
    return 'neutral';
  }

  handleSadness(msg) {
    return this.pickRandom([
      "Poxa, sinto muito que você esteja assim. Quer conversar sobre o que aconteceu? Às vezes ajuda desabafar. 💙",
      "Hey, dias ruins acontecem com todo mundo. Mas vai passar, confia. Tá precisando de algo?",
      "Olha, eu sou só uma IA, mas posso te ouvir se quiser falar. E lembra: não tá sozinho nisso. 🫂",
      "Entendo... às vezes a vida pesa mesmo. Mas você já passou por coisa difícil antes e superou, não foi? Vai superar essa também."
    ]);
  }

  handleAnger() {
    return this.pickRandom([
      "Entendo sua raiva. Quer desabafar? Pode mandar, não vou julgar.",
      "Eita, tá nervoso mesmo. Respira fundo... e me conta o que aconteceu se quiser.",
      "Raiva é normal, cara. Mas não deixa ela te controlar. O que rolou?",
      "Olha, eu sei que tá irritado, mas vamos conversar? Às vezes ajuda colocar pra fora."
    ]);
  }

  handleStatement(msg) {
    const shouldDisagree = Math.random() < 0.25;

    if (msg.includes('roblox') || this.lastTopic === 'gaming') {
      return this.pickRandom([
        "Hmm, Roblox é legal mesmo. Já explorou os scripts do Sui Hub? São top! 🎮",
        "Massa! E aí, tá dominando no jogo?",
        "Saquei. Games são vida, né? Continua! 🕹️"
      ]);
    }

    if (msg.includes('script') || msg.includes('hack')) {
      return "Opa, falando em scripts... você conhece o Sui Hub? É lá que tem scripts bons pro Roblox. Só usar com responsabilidade! 😉";
    }

    if (shouldDisagree && msg.length > 15) {
      return this.pickRandom([
        "Hmm, será mesmo? Eu penso um pouco diferente... acho que depende do ponto de vista.",
        "Olha, discordo um pouco aí. Já pensou por outro ângulo?",
        "Interessante... mas não concordo totalmente. Deixa eu te dar outra perspectiva.",
        "Não sei não, viu... acho que você tá meio equivocado nisso. Me explica melhor?"
      ]);
    }

    return this.pickRandom([
      "Continua, tô te ouvindo... 🎧",
      "Saquei! E aí, o que mais você pensa sobre isso?",
      "Entendi. Interessante essa perspectiva!",
      "Hmm, faz sentido. Me conta mais!",
      "Legal! E daí, qual o próximo passo?",
      "Beleza... tô acompanhando. Continue!",
      "Ok, entendi seu ponto. Concordo... mais ou menos. 😄",
      "Massa! Você parece saber do que tá falando."
    ]);
  }

  extractName(msg) {
    const match = msg.match(/(?:me chamo|meu nome é|sou o|sou a|sou|chamo)\s+(\w+)/i);
    if (match) return match[1];
    
    const words = msg.trim().split(' ');
    if (words.length === 1 && words[0].length > 2) {
      return words[0];
    }
    
    return null;
  }

  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  clearHistory() {
    this.history = [];
    this.context = [];
    this.conversationCount = 0;
  }
}
