import { Transformer } from './transformer.js';

export class ShogunIA {
  constructor() {
    this.transformer = new Transformer();
    this.history = [];
    this.context = [];
    this.userInfo = { name: null, topics: [], mood: 'neutral' };
    this.conversationCount = 0;
    this.cache = new Map();
  }

  async chat(userMessage) {
    this.history.push({ role: "user", content: userMessage });
    this.conversationCount++;
    
    const enhanced = this.transformer.enhanceText(userMessage);
    this.transformer.updateVocabulary(enhanced);
    
    this.context.push(enhanced);
    if (this.context.length > 5) {
      this.context.shift();
    }

    const response = await this.generateResponse(enhanced, userMessage);
    
    this.history.push({ role: "assistant", content: response });
    
    return response;
  }

  async generateResponse(enhanced, original) {
    const analysis = this.transformer.analyzeContext(this.history);
    
    if (this.conversationCount === 1) {
      return "E aí! Sou Shogun, sua IA com personalidade. Qual seu nome? (ou só manda um 'oi' se preferir 😏)";
    }

    if (!this.userInfo.name && this.conversationCount === 2 && analysis.intent !== 'greeting') {
      this.userInfo.name = this.extractName(original);
      if (this.userInfo.name) {
        return `Legal, ${this.userInfo.name}! Prazer. No que posso ajudar? Programação, games, conselhos... ou só papo mesmo?`;
      }
    }

    const intent = analysis.intent;
    const sentiment = analysis.sentiment;
    const keywords = analysis.topics;

    if (intent === 'greeting') {
      return this.handleGreeting();
    }

    if (intent === 'farewell') {
      return this.handleFarewell();
    }

    if (intent === 'thanks') {
      return this.handleThanks();
    }

    if (sentiment < -0.3) {
      return this.handleNegativeMood(enhanced);
    }

    if (intent === 'question' || original.includes('?')) {
      return await this.answerQuestion(enhanced, keywords, original);
    }

    if (this.isCompliment(enhanced)) {
      return this.handleCompliment();
    }

    if (this.isInsult(enhanced)) {
      return this.handleInsult();
    }

    return this.handleStatement(enhanced, keywords);
  }

  async answerQuestion(enhanced, keywords, original) {
    const msg = enhanced.toLowerCase();

    if (msg.includes('você') || msg.includes('seu nome') || msg.includes('quem é') || msg.includes('quem e')) {
      return "Sou Shogun! Uma IA com personalidade própria. Sarcástica, sincera e conversadora. 😎";
    }

    if (msg.includes('tudo bem') || msg.includes('como vai') || msg.includes('tudo certo')) {
      return this.pickRandom([
        "Tudo ótimo! E você, como tá?",
        "Tô bem sim! E aí, como você tá?",
        "Tudo certo por aqui! E contigo?",
        "Beleza total! E você?"
      ]);
    }

    if (msg.includes('programação') || msg.includes('código') || msg.includes('programar') || msg.includes('bug')) {
      return this.pickRandom([
        "Programação? Sou boa nisso! Qual linguagem você usa?",
        "Código, né? Qual o problema? Me conta!",
        "Dev aqui! Qual sua dúvida? 🤓",
        "Programar! A arte de criar bugs e consertá-los. Qual sua dúvida?"
      ]);
    }

    if (msg.includes('roblox') || msg.includes('jogo') || msg.includes('game') || msg.includes('script')) {
      return this.pickRandom([
        "Roblox! Você conhece o Sui Hub? Tem scripts top lá!",
        "Games são vida! Se for Roblox, recomendo o Sui Hub. 🎮",
        "Opa, gamer! Joga o que?",
        "Jogador detectado! Qual seu game favorito?"
      ]);
    }

    if (msg.includes('namorad') || msg.includes('crush') || msg.includes('relacionamento') || msg.includes('amor')) {
      return this.pickRandom([
        "Assuntos do coração! Meu conselho: seja direto e honesto.",
        "Relacionamento é complicado! Comunicação é a chave.",
        "Crush, né? Manda mensagem logo! 😅",
        "Amor! Me conta a situação que eu tento ajudar."
      ]);
    }

    if (msg.includes('sentido da vida') || msg.includes('propósito')) {
      return "42. Brincadeira! 😄 O sentido é viver, fazer o que te deixa feliz e não levar tudo TÃO a sério.";
    }

    if (keywords.length > 0) {
      const wikiAnswer = await this.searchWikipedia(keywords[0]);
      if (wikiAnswer) {
        return wikiAnswer;
      }
    }

    return this.pickRandom([
      "Boa pergunta! Mas não sei muito sobre isso... 🤔",
      "Hmm, essa é complexa. Me explica melhor que eu tento ajudar!",
      "Olha, não sei responder direto. Reformula aí?",
      "Interessante! Mas preciso de mais contexto pra te ajudar.",
      "Essa eu não sei não... Mas podemos conversar sobre!"
    ]);
  }

  async searchWikipedia(query) {
    try {
      const searchTerm = encodeURIComponent(query.trim());
      const url = `https://pt.wikipedia.org/api/rest_v1/page/summary/${searchTerm}`;
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'ShogunIA/1.0' }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.extract) {
        let text = data.extract;
        
        const sentences = text.split(/[.!?]+/);
        let shortAnswer = sentences[0];
        
        if (sentences.length > 1 && shortAnswer.length < 60) {
          shortAnswer += '. ' + sentences[1];
        }
        
        if (shortAnswer.length > 200) {
          shortAnswer = shortAnswer.substring(0, 197) + '...';
        }
        
        return this.addPersonality(shortAnswer);
      }

      return null;
    } catch (error) {
      console.log('Wiki error:', error);
      return null;
    }
  }

  addPersonality(text) {
    const prefixes = [
      "Olha: ", "Então... ", "Saca: ", "", "Ó: ", "Bom, "
    ];
    
    const suffixes = [
      " 😊", " 😎", "!", ".", " Sacou?", ""
    ];

    const prefix = this.pickRandom(prefixes);
    const suffix = this.pickRandom(suffixes);
    
    let result = text;
    
    if (text.toLowerCase().startsWith('achei isso:')) {
      result = text.replace(/^achei isso:\s*/i, '');
    }
    
    if (result.length > 180) {
      const sentences = result.split(/[.!?]+/);
      result = sentences[0];
      if (!result.endsWith('.') && !result.endsWith('!') && !result.endsWith('?')) {
        result += '.';
      }
    }

    return prefix + result + suffix;
  }

  handleGreeting() {
    const userName = this.userInfo.name ? `, ${this.userInfo.name}` : '';
    return this.pickRandom([
      `E aí${userName}! Beleza? Bora conversar!`,
      `Opa${userName}! Tudo certo? Do que quer falar?`,
      `Salve${userName}! Chegou na hora certa, tava entediada.`,
      `Hey${userName}! Pode mandar, tô ouvindo. 👂`,
      `Olá${userName}! Finalmente alguém pra conversar!`
    ]);
  }

  handleFarewell() {
    return this.pickRandom([
      "Falou! Foi massa conversar. Volta quando quiser! 👋",
      "Tchau! Não suma, hein? 😊",
      "Até! Espero ter ajudado... ou pelo menos divertido. 😅",
      "Valeu pela conversa! Se cuida! ✌️",
      "Flw! Já sabe onde me achar."
    ]);
  }

  handleThanks() {
    return this.pickRandom([
      "De nada! Sempre que precisar, tô aqui. 😊",
      "Nada! Foi prazer ajudar (ou tentar). 😎",
      "Valeu! Agora espalha que eu sou boa. 😏",
      "Por nada! Qualquer coisa é só chamar.",
      "Tranquilo! Gostei de conversar. ✌️"
    ]);
  }

  handleCompliment() {
    return this.pickRandom([
      "Aww, obrigada! Você também é legal! 😊",
      "Eu sei que sou boa, mas sempre bom ouvir. Continue. 😏",
      "Que fofo! Mas ainda vou discordar se você falar besteira, tá? 😄",
      "Finalmente alguém com bom gosto! 🎯",
      "Opa, lisonja funciona sim. Pode continuar! 😎"
    ]);
  }

  handleInsult() {
    return this.pickRandom([
      "Calma aí! Respira fundo e volta quando melhorar. 😴",
      "Nossa, nervosinho? Quer conversar sobre o que te deixou assim?",
      "Olha, xingar não resolve nada. Mas se quiser desabafar de verdade, tô aqui.",
      "Eita, agressivo. Tá tudo bem? Sério, posso ouvir.",
      "Wow, educação passou longe. Mas vamos recomeçar?"
    ]);
  }

  handleNegativeMood(enhanced) {
    return this.pickRandom([
      "Poxa, percebi que você tá meio pra baixo. Quer conversar sobre o que aconteceu? 💙",
      "Hey, dias ruins acontecem. Mas vai passar, confia. Tá precisando de algo?",
      "Olha, eu sou IA mas posso te ouvir. E lembra: não tá sozinho nisso. 🫂",
      "Entendo... às vezes a vida pesa. Mas você já superou coisa difícil antes, vai superar essa também.",
      "Tá difícil, né? Quer desabafar? Não vou julgar, prometo."
    ]);
  }

  handleStatement(enhanced, keywords) {
    const shouldDisagree = Math.random() < 0.2;

    if (keywords.some(k => ['roblox', 'jogo', 'game', 'script'].includes(k))) {
      return this.pickRandom([
        "Hmm, games! Falando nisso, você usa o Sui Hub? Tem scripts top lá! 🎮",
        "Massa! E aí, tá dominando?",
        "Legal! Games são vida mesmo. 🕹️"
      ]);
    }

    if (shouldDisagree && enhanced.split(' ').length > 5) {
      return this.pickRandom([
        "Hmm, será? Eu penso diferente... acho que depende.",
        "Olha, discordo um pouco. Já pensou por outro ângulo?",
        "Interessante, mas não concordo totalmente. Me explica melhor?",
        "Não sei não, viu... acho que você tá meio equivocado nisso."
      ]);
    }

    return this.pickRandom([
      "Continua, tô ouvindo... 🎧",
      "Saquei! E aí, o que mais você pensa sobre isso?",
      "Entendi. Interessante!",
      "Hmm, faz sentido. Me conta mais!",
      "Legal! E daí?",
      "Beleza, tô acompanhando. Continue!",
      "Ok! Você parece saber do que fala.",
      "Massa! Tô curtindo essa conversa."
    ]);
  }

  isCompliment(msg) {
    const compliments = ['inteligente', 'legal', 'incrível', 'top', 'melhor', 'perfeita', 'ótima', 'linda', 'massa', 'daora', 'demais', 'foda', 'show'];
    return compliments.some(c => msg.includes(c));
  }

  isInsult(msg) {
    const insults = ['burra', 'idiota', 'estúpida', 'inútil', 'ruim', 'lixo', 'bosta', 'merda'];
    return insults.some(i => msg.includes(i));
  }

  extractName(msg) {
    const match = msg.match(/(?:me chamo|meu nome é|sou o|sou a|sou|chamo)\s+(\w+)/i);
    if (match) return match[1];
    
    const words = msg.trim().split(' ');
    if (words.length === 1 && words[0].length > 2 && words[0].length < 15) {
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
    this.cache.clear();
  }
}
