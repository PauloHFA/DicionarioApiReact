import axios from 'axios';
import { DictionaryEntry, DicionarioAbertoEntry, SearchType } from '../types/dictionary';
import { DictionarySubject } from '../patterns/Observer';

export class DictionaryService extends DictionarySubject {
  private static instance: DictionaryService;

  private constructor() {
    super();
  }

  public static getInstance(): DictionaryService {
    if (!DictionaryService.instance) {
      DictionaryService.instance = new DictionaryService();
    }
    return DictionaryService.instance;
  }

  parseXMLContent(xml: string): { definition: string, grammarClass: string } {
    const defMatch = xml.match(/<def>(.*?)<\/def>/s);
    const gramMatch = xml.match(/<gramGrp>(.*?)<\/gramGrp>/s);
    
    return {
      definition: defMatch ? defMatch[1].trim().replace(/\n/g, ' ') : '',
      grammarClass: gramMatch ? gramMatch[1].trim() : ''
    };
  }

  async search(word: string, searchType: SearchType) {
    this.setLoading(true);

    try {
      // Busca no Dicionário Aberto
      const dicionarioAbertoData = await this.searchDicionarioAberto(word, searchType);
      
      if (searchType === 'near') {
        this.notifyObservers({ type: 'near', value: dicionarioAbertoData });
        this.notifyObservers({ type: 'dicionarioAberto', value: [] });
      } else {
        this.notifyObservers({ type: 'dicionarioAberto', value: dicionarioAbertoData });
      }

      // Busca na API em inglês apenas se for pesquisa normal
      if (searchType === 'normal') {
        try {
          const response = await axios.get<DictionaryEntry[]>(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
          this.notifyObservers({ type: 'english', value: response.data });
        } catch (error: any) {
          if (error.response?.status !== 404) {
            console.error('Erro ao buscar definições em inglês:', error);
          }
          this.notifyObservers({ type: 'english', value: [] });
        }
      } else {
        this.notifyObservers({ type: 'english', value: [] });
      }
    } catch (error) {
      console.error('Erro ao buscar definições:', error);
      this.notifyObservers({ type: 'error', value: error });
    } finally {
      this.setLoading(false);
    }
  }

  private async searchDicionarioAberto(word: string, searchType: SearchType) {
    let endpoint = '';
    switch (searchType) {
      case 'normal':
        endpoint = `word/${word.toLowerCase()}`;
        break;
      case 'prefix':
        endpoint = `prefix/${word.toLowerCase()}`;
        break;
      case 'suffix':
        endpoint = `suffix/${word.toLowerCase()}`;
        break;
      case 'infix':
        endpoint = `infix/${word.toLowerCase()}`;
        break;
      case 'near':
        endpoint = `near/${word.toLowerCase()}`;
        break;
      case 'random':
        endpoint = 'random';
        break;
      case 'wotd':
        endpoint = 'wotd';
        break;
    }

    try {
      const response = await axios.get(`https://api.dicionario-aberto.net/${endpoint}`);
      
      if (searchType === 'wotd') {
        const wotd = response.data;
        const { definition, grammarClass } = this.parseXMLContent(wotd.xml);
        return [{
          word: wotd.word,
          sense: 1,
          xml: wotd.xml,
          grammarClass
        }];
      } else if (searchType === 'random') {
        const randomWord = response.data;
        const wordResponse = await axios.get(`https://api.dicionario-aberto.net/word/${randomWord.word}`);
        return wordResponse.data;
      } else if (['prefix', 'suffix', 'infix'].includes(searchType)) {
        return response.data.map((item: any) => ({
          word: item.word,
          sense: item.sense,
          xml: `<def>${item.preview}</def>`,
          preview: item.preview
        }));
      } else if (searchType === 'near') {
        return response.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao buscar no Dicionário Aberto:', error);
      return [];
    }
  }
} 