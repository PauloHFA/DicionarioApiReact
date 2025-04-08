import { useState, useMemo } from 'react'
import styled from '@emotion/styled'
import axios from 'axios'
import { DictionaryEntry, DicionarioAbertoEntry, SearchType } from './types/dictionary'
import { SearchBar } from './components/SearchBar'
import { WordCard } from './components/WordCard'
import React from 'react'

const Container = styled.div`
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

const Title = styled.h1`
  text-align: center;
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin: 2rem 0;
  color: #1a365d;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
`

const ResultsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0;
  background-color: #f8fafc;
`

// Observer Interface
interface DictionaryObserver {
  update(data: any): void;
}

// Subject (Observable)
class DictionarySearch {
  private observers: DictionaryObserver[] = [];
  private loading: boolean = false;

  parseXMLContent(xml: string): { definition: string, grammarClass: string } {
    const defMatch = xml.match(/<def>(.*?)<\/def>/s)
    const gramMatch = xml.match(/<gramGrp>(.*?)<\/gramGrp>/s)
    
    return {
      definition: defMatch ? defMatch[1].trim().replace(/\n/g, ' ') : '',
      grammarClass: gramMatch ? gramMatch[1].trim() : ''
    }
  }

  addObserver(observer: DictionaryObserver) {
    this.observers.push(observer);
  }

  removeObserver(observer: DictionaryObserver) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  private notifyObservers(data: any) {
    this.observers.forEach(observer => observer.update(data));
  }

  async search(word: string, searchType: SearchType) {
    this.loading = true;
    this.notifyObservers({ type: 'loading', value: true });

    try {
      // Busca no Dicionário Aberto
      const dicionarioAbertoData = await this.searchDicionarioAberto(word, searchType);
      
      if (searchType === 'near') {
        // Para buscas de palavras similares, enviamos apenas o array de palavras
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
      this.loading = false;
      this.notifyObservers({ type: 'loading', value: false });
    }
  }

  private async searchDicionarioAberto(word: string, searchType: SearchType) {
    let endpoint = ''
    switch (searchType) {
      case 'normal':
        endpoint = `word/${word.toLowerCase()}`
        break
      case 'prefix':
        endpoint = `prefix/${word.toLowerCase()}`
        break
      case 'suffix':
        endpoint = `suffix/${word.toLowerCase()}`
        break
      case 'infix':
        endpoint = `infix/${word.toLowerCase()}`
        break
      case 'near':
        endpoint = `near/${word.toLowerCase()}`
        break
      case 'random':
        endpoint = 'random'
        break
      case 'wotd':
        endpoint = 'wotd'
        break
    }

    try {
      const response = await axios.get(`https://api.dicionario-aberto.net/${endpoint}`)
      
      if (searchType === 'wotd') {
        const wotd = response.data
        const { definition, grammarClass } = this.parseXMLContent(wotd.xml)
        return [{
          word: wotd.word,
          sense: 1,
          xml: wotd.xml,
          grammarClass
        }]
      } else if (searchType === 'random') {
        const randomWord = response.data
        const wordResponse = await axios.get(`https://api.dicionario-aberto.net/word/${randomWord.word}`)
        return wordResponse.data
      } else if (['prefix', 'suffix', 'infix'].includes(searchType)) {
        return response.data.map((item: any) => ({
          word: item.word,
          sense: item.sense,
          xml: `<def>${item.preview}</def>`,
          preview: item.preview
        }))
      } else if (searchType === 'near') {
        return response.data
      } else {
        return response.data
      }
    } catch (error) {
      console.error('Erro ao buscar no Dicionário Aberto:', error)
      return []
    }
  }
}

// Concrete Observer
class DictionaryUI implements DictionaryObserver {
  private setDefinitions: (definitions: DictionaryEntry[]) => void;
  private setDicionarioAbertoDefinitions: (definitions: DicionarioAbertoEntry[]) => void;
  private setNearWords: (words: string[]) => void;
  private setLoading: (loading: boolean) => void;

  constructor(
    setDefinitions: (definitions: DictionaryEntry[]) => void,
    setDicionarioAbertoDefinitions: (definitions: DicionarioAbertoEntry[]) => void,
    setNearWords: (words: string[]) => void,
    setLoading: (loading: boolean) => void
  ) {
    this.setDefinitions = setDefinitions;
    this.setDicionarioAbertoDefinitions = setDicionarioAbertoDefinitions;
    this.setNearWords = setNearWords;
    this.setLoading = setLoading;
  }

  update(data: any) {
    switch (data.type) {
      case 'loading':
        this.setLoading(data.value);
        break;
      case 'english':
        this.setDefinitions(data.value);
        break;
      case 'dicionarioAberto':
        this.setDicionarioAbertoDefinitions(data.value);
        break;
      case 'near':
        this.setNearWords(data.value || []);
        break;
      case 'error':
        console.error('Erro na busca:', data.value);
        break;
    }
  }
}

function App() {
  const [word, setWord] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('normal')
  const [definitions, setDefinitions] = useState<DictionaryEntry[]>([])
  const [dicionarioAbertoDefinitions, setDicionarioAbertoDefinitions] = useState<DicionarioAbertoEntry[]>([])
  const [nearWords, setNearWords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const dictionarySearch = useMemo(() => {
    const search = new DictionarySearch();
    const uiObserver = new DictionaryUI(
      setDefinitions,
      setDicionarioAbertoDefinitions,
      setNearWords,
      setLoading
    );
    search.addObserver(uiObserver);
    return search;
  }, []);

  const searchWord = async () => {
    if (!word.trim() && searchType !== 'random' && searchType !== 'wotd') {
      alert('Por favor, digite uma palavra para pesquisar')
      return
    }
    await dictionarySearch.search(word, searchType);
  }

  return (
    <Container>
      <Title>Dicionário</Title>
      <SearchBar
        word={word}
        setWord={setWord}
        searchType={searchType}
        setSearchType={setSearchType}
        loading={loading}
        onSearch={searchWord}
      />

      <ResultsContainer>
        {nearWords.length > 0 && searchType === 'near' && (
          <WordCard
            entry={{ word, sense: 1, xml: '' }}
            type="pt"
            nearWords={nearWords}
          />
        )}

        {dicionarioAbertoDefinitions.map((entry, index) => (
          <WordCard
            key={index}
            entry={entry}
            type="pt"
            nearWords={searchType !== 'near' ? nearWords : undefined}
            parseXMLContent={dictionarySearch.parseXMLContent}
          />
        ))}

        {definitions.map((entry, index) => (
          <WordCard
            key={index}
            entry={entry}
            type="en"
          />
        ))}
      </ResultsContainer>
    </Container>
  )
}

export default App;
