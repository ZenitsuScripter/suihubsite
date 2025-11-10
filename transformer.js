export class Transformer {
  constructor() {
    this.vocabulary = new Map();
    this.embeddings = new Map();
    this.attentionWeights = [];
    this.vocabSize = 0;
    this.embeddingDim = 64;
    this.numHeads = 4;
    this.maxSeqLength = 50;
    this.temperature = 0.8;
    
    this.initializeVocabulary();
    this.initializeEmbeddings();
  }

  initializeVocabulary() {
    const commonWords = [
      'o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não',
      'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi',
      'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito',
      'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso',
      'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem',
      'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num',
      'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia',
      'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas',
      'este', 'fosse', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas',
      'olá', 'oi', 'tchau', 'obrigado', 'por favor', 'sim', 'não', 'talvez', 'claro',
      'bom', 'legal', 'ótimo', 'ruim', 'péssimo', 'grande', 'pequeno', 'muito', 'pouco',
      'sempre', 'nunca', 'hoje', 'ontem', 'amanhã', 'agora', 'depois', 'antes', 'aqui',
      'ali', 'lá', 'onde', 'quando', 'como', 'porque', 'porquê', 'quanto', 'quem', 'qual',
      'programação', 'código', 'javascript', 'python', 'java', 'html', 'css', 'web',
      'site', 'aplicativo', 'app', 'sistema', 'software', 'hardware', 'computador',
      'internet', 'rede', 'servidor', 'cliente', 'dados', 'arquivo', 'pasta', 'banco',
      'ia', 'inteligência', 'artificial', 'machine', 'learning', 'neural', 'rede',
      'jogo', 'game', 'roblox', 'minecraft', 'fortnite', 'jogador', 'gamer', 'jogar',
      'script', 'hack', 'mod', 'cheat', 'exploit', 'bug', 'erro', 'problema', 'ajuda',
      'pessoa', 'amigo', 'família', 'amor', 'relacionamento', 'namorado', 'namorada',
      'vida', 'morte', 'feliz', 'triste', 'raiva', 'medo', 'alegria', 'tristeza',
      'trabalho', 'estudo', 'escola', 'faculdade', 'professor', 'aluno', 'aula',
      'casa', 'rua', 'cidade', 'país', 'mundo', 'terra', 'universo', 'espaço'
    ];

    commonWords.forEach((word, idx) => {
      this.vocabulary.set(word, idx);
    });
    this.vocabSize = this.vocabulary.size;
  }

  initializeEmbeddings() {
    this.vocabulary.forEach((idx, word) => {
      const embedding = Array(this.embeddingDim).fill(0).map(() => 
        (Math.random() - 0.5) * 0.1
      );
      this.embeddings.set(word, embedding);
    });
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  getEmbedding(word) {
    if (this.embeddings.has(word)) {
      return this.embeddings.get(word);
    }
    
    const newEmbedding = Array(this.embeddingDim).fill(0).map(() => 
      (Math.random() - 0.5) * 0.1
    );
    this.embeddings.set(word, newEmbedding);
    return newEmbedding;
  }

  encodeSequence(tokens) {
    const sequence = tokens.slice(0, this.maxSeqLength);
    return sequence.map(token => this.getEmbedding(token));
  }

  dotProduct(a, b) {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  softmax(logits) {
    const maxLogit = Math.max(...logits);
    const expScores = logits.map(x => Math.exp((x - maxLogit) / this.temperature));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    return expScores.map(x => x / sumExp);
  }

  multiHeadAttention(queries, keys, values) {
    const seqLen = queries.length;
    const headDim = this.embeddingDim / this.numHeads;
    const outputs = Array(seqLen).fill(0).map(() => Array(this.embeddingDim).fill(0));

    for (let head = 0; head < this.numHeads; head++) {
      const startIdx = head * headDim;
      const endIdx = startIdx + headDim;

      for (let i = 0; i < seqLen; i++) {
        const query = queries[i].slice(startIdx, endIdx);
        const scores = [];

        for (let j = 0; j < seqLen; j++) {
          const key = keys[j].slice(startIdx, endIdx);
          const score = this.dotProduct(query, key) / Math.sqrt(headDim);
          scores.push(score);
        }

        const attentionWeights = this.softmax(scores);

        for (let j = 0; j < seqLen; j++) {
          const value = values[j].slice(startIdx, endIdx);
          for (let k = 0; k < headDim; k++) {
            outputs[i][startIdx + k] += attentionWeights[j] * value[k];
          }
        }
      }
    }

    return outputs;
  }

  feedForward(x) {
    const hiddenSize = this.embeddingDim * 4;
    const hidden = Array(hiddenSize).fill(0).map(() => Math.random() - 0.5);
    
    for (let i = 0; i < hiddenSize; i++) {
      let sum = 0;
      for (let j = 0; j < x.length; j++) {
        sum += x[j] * (Math.random() - 0.5);
      }
      hidden[i] = Math.max(0, sum);
    }

    const output = Array(this.embeddingDim).fill(0);
    for (let i = 0; i < this.embeddingDim; i++) {
      let sum = 0;
      for (let j = 0; j < hiddenSize; j++) {
        sum += hidden[j] * (Math.random() - 0.5);
      }
      output[i] = sum;
    }

    return output;
  }

  layerNorm(x) {
    const mean = x.reduce((a, b) => a + b, 0) / x.length;
    const variance = x.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / x.length;
    const std = Math.sqrt(variance + 1e-6);
    return x.map(val => (val - mean) / std);
  }

  transformerBlock(embeddings) {
    const attended = this.multiHeadAttention(embeddings, embeddings, embeddings);
    
    const residual1 = embeddings.map((emb, i) => 
      emb.map((val, j) => val + attended[i][j])
    );
    
    const normalized1 = residual1.map(x => this.layerNorm(x));
    
    const ffOutput = normalized1.map(x => this.feedForward(x));
    
    const residual2 = normalized1.map((emb, i) => 
      emb.map((val, j) => val + ffOutput[i][j])
    );
    
    return residual2.map(x => this.layerNorm(x));
  }

  cosineSimilarity(a, b) {
    const dot = this.dotProduct(a, b);
    const magA = Math.sqrt(this.dotProduct(a, a));
    const magB = Math.sqrt(this.dotProduct(b, b));
    return dot / (magA * magB + 1e-10);
  }

  findMostSimilar(embedding, topK = 5) {
    const similarities = [];
    
    this.embeddings.forEach((emb, word) => {
      const sim = this.cosineSimilarity(embedding, emb);
      similarities.push({ word, similarity: sim });
    });

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.word);
  }

  generateNextWord(context) {
    const tokens = this.tokenize(context);
    const embeddings = this.encodeSequence(tokens);
    
    if (embeddings.length === 0) {
      return this.pickRandom(['interessante', 'entendo', 'continua', 'hmm']);
    }

    const transformed = this.transformerBlock(embeddings);
    const lastEmbedding = transformed[transformed.length - 1];
    
    const candidates = this.findMostSimilar(lastEmbedding, 10);
    
    const lastWord = tokens[tokens.length - 1];
    const filtered = candidates.filter(w => w !== lastWord);
    
    return this.pickRandom(filtered.length > 0 ? filtered : candidates);
  }

  generate(prompt, maxLength = 20) {
    let result = prompt;
    let tokens = this.tokenize(prompt);
    
    for (let i = 0; i < maxLength; i++) {
      const context = tokens.slice(-10).join(' ');
      const nextWord = this.generateNextWord(context);
      
      if (!nextWord) break;
      
      result += ' ' + nextWord;
      tokens.push(nextWord);
      
      if (['.', '!', '?'].some(punct => nextWord.endsWith(punct))) {
        break;
      }
    }
    
    return result;
  }

  calculateSentiment(text) {
    const positiveWords = [
      'bom', 'ótimo', 'excelente', 'legal', 'incrível', 'maravilhoso', 'perfeito',
      'feliz', 'alegre', 'amor', 'adoro', 'gosto', 'melhor', 'top', 'show', 'massa',
      'demais', 'foda', 'daora', 'bacana', 'maneiro', 'sucesso', 'vitória', 'ganhar'
    ];

    const negativeWords = [
      'ruim', 'péssimo', 'horrível', 'terrível', 'triste', 'mal', 'odeio', 'detesto',
      'pior', 'difícil', 'problema', 'erro', 'falha', 'fracasso', 'perder', 'raiva',
      'irritado', 'chato', 'entediado', 'cansado', 'frustrado', 'decepcionado'
    ];

    const tokens = this.tokenize(text);
    let score = 0;

    tokens.forEach(token => {
      if (positiveWords.includes(token)) score += 1;
      if (negativeWords.includes(token)) score -= 1;
    });

    return Math.max(-1, Math.min(1, score / Math.max(1, tokens.length)));
  }

  extractKeywords(text, topN = 5) {
    const tokens = this.tokenize(text);
    const stopWords = new Set([
      'o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não',
      'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas'
    ]);

    const wordFreq = {};
    tokens.forEach(token => {
      if (!stopWords.has(token) && token.length > 2) {
        wordFreq[token] = (wordFreq[token] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([word]) => word);
  }

  calculateSemanticSimilarity(text1, text2) {
    const tokens1 = this.tokenize(text1);
    const tokens2 = this.tokenize(text2);

    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    const embeddings1 = this.encodeSequence(tokens1);
    const embeddings2 = this.encodeSequence(tokens2);

    const avg1 = Array(this.embeddingDim).fill(0);
    embeddings1.forEach(emb => {
      emb.forEach((val, i) => avg1[i] += val);
    });
    avg1.forEach((val, i) => avg1[i] /= embeddings1.length);

    const avg2 = Array(this.embeddingDim).fill(0);
    embeddings2.forEach(emb => {
      emb.forEach((val, i) => avg2[i] += val);
    });
    avg2.forEach((val, i) => avg2[i] /= embeddings2.length);

    return this.cosineSimilarity(avg1, avg2);
  }

  classifyIntent(text) {
    const intents = {
      greeting: ['oi', 'olá', 'hey', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'salve'],
      question: ['como', 'por que', 'o que', 'qual', 'quando', 'onde', 'quem', '?'],
      help: ['ajuda', 'ajudar', 'socorro', 'não sei', 'dúvida', 'problema'],
      farewell: ['tchau', 'até', 'adeus', 'falou', 'bye', 'até mais'],
      thanks: ['obrigado', 'obrigada', 'valeu', 'agradeço', 'grato'],
      affirmation: ['sim', 'ok', 'certo', 'beleza', 'concordo', 'exato'],
      negation: ['não', 'nunca', 'jamais', 'nada', 'discordo']
    };

    const tokens = this.tokenize(text);
    const scores = {};

    Object.keys(intents).forEach(intent => {
      scores[intent] = 0;
      intents[intent].forEach(keyword => {
        if (tokens.includes(keyword) || text.toLowerCase().includes(keyword)) {
          scores[intent] += 1;
        }
      });
    });

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'statement';

    return Object.entries(scores)
      .filter(([_, score]) => score === maxScore)
      .map(([intent]) => intent)[0];
  }

  correctTypos(text) {
    const corrections = {
      'vc': 'você', 'voce': 'você', 'q': 'que', 'pq': 'porque', 'tb': 'também',
      'n': 'não', 'nao': 'não', 'eh': 'é', 'ta': 'está', 'tá': 'está',
      'mt': 'muito', 'mto': 'muito', 'blz': 'beleza', 'vlw': 'valeu',
      'obg': 'obrigado', 'tbm': 'também', 'tmb': 'também', 'oq': 'o que',
      'pra': 'para', 'pro': 'para', 'cmg': 'comigo', 'ctg': 'contigo',
      'd': 'de', 'msg': 'mensagem', 'hj': 'hoje', 'agr': 'agora',
      'dps': 'depois', 'sla': 'sei lá', 'fds': 'fim de semana'
    };

    let corrected = text.toLowerCase();
    Object.entries(corrections).forEach(([typo, correct]) => {
      const regex = new RegExp('\\b' + typo + '\\b', 'gi');
      corrected = corrected.replace(regex, correct);
    });

    return corrected;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  findClosestWord(word) {
    let minDistance = Infinity;
    let closestWord = word;

    this.vocabulary.forEach((_, vocabWord) => {
      const distance = this.levenshteinDistance(word, vocabWord);
      if (distance < minDistance && distance <= 2) {
        minDistance = distance;
        closestWord = vocabWord;
      }
    });

    return closestWord;
  }

  enhanceText(text) {
    const corrected = this.correctTypos(text);
    const tokens = this.tokenize(corrected);
    
    const enhanced = tokens.map(token => {
      if (!this.vocabulary.has(token)) {
        return this.findClosestWord(token);
      }
      return token;
    });

    return enhanced.join(' ');
  }

  analyzeContext(history) {
    if (history.length === 0) return { topics: [], sentiment: 0, intent: 'unknown' };

    const recentMessages = history.slice(-5);
    const combinedText = recentMessages.map(msg => msg.content).join(' ');

    const topics = this.extractKeywords(combinedText, 3);
    const sentiment = this.calculateSentiment(combinedText);
    const lastMessage = recentMessages[recentMessages.length - 1].content;
    const intent = this.classifyIntent(lastMessage);

    return { topics, sentiment, intent };
  }

  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  setTemperature(temp) {
    this.temperature = Math.max(0.1, Math.min(2.0, temp));
  }

  updateVocabulary(text) {
    const tokens = this.tokenize(text);
    tokens.forEach(token => {
      if (!this.vocabulary.has(token)) {
        this.vocabulary.set(token, this.vocabSize++);
        const embedding = Array(this.embeddingDim).fill(0).map(() => 
          (Math.random() - 0.5) * 0.1
        );
        this.embeddings.set(token, embedding);
      }
    });
  }
}
