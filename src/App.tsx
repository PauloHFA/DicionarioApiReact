import { useState, useMemo } from 'react'
import styled from '@emotion/styled'
import axios from 'axios'
import { DictionaryEntry } from './types/dictionary'
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

const SearchContainer = styled.div`
  width: 100%;
  background-color: white;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  justify-content: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`

const SearchTypeButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  color: ${props => props.active ? 'white' : '#2c5282'};
  background-color: ${props => props.active ? '#2c5282' : 'white'};
  border: 2px solid #2c5282;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    background-color: ${props => props.active ? '#2a4365' : '#ebf8ff'};
    transform: translateY(-1px);
  }
`

const SearchInput = styled.input`
  width: 100%;
  max-width: 1200px;
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  margin: 0 auto 1rem auto;
  transition: all 0.3s ease;
  display: block;
  
  &:focus {
    outline: none;
    border-color: #2c5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`

const SearchButton = styled.button<{ disabled: boolean }>`
  width: 100%;
  max-width: 1200px;
  padding: 1rem;
  font-size: 1.1rem;
  color: white;
  background-color: ${props => props.disabled ? '#90cdf4' : '#2c5282'};
  border: none;
  border-radius: 0.75rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  display: block;

  &:hover {
    background-color: ${props => props.disabled ? '#90cdf4' : '#2a4365'};
    transform: translateY(-1px);
  }
`

const ResultsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0;
  background-color: #f8fafc;
`

const WordCard = styled.div`
  width: 100%;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: none;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`

const WordTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  color: #1a365d;
  font-weight: 700;
`

const Phonetic = styled.p`
  color: #4a5568;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-style: italic;
  padding: 0.5rem 1rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  display: inline-block;
`

const PartOfSpeech = styled.h3`
  color: #2c5282;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  text-transform: capitalize;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
`

const Definition = styled.div`
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
  font-size: 1.2rem;
  line-height: 1.6;
  background-color: #f7fafc;
  border-radius: 0.75rem;

  strong {
    color: #2a4365;
    font-weight: 600;
  }

  p {
    margin-bottom: 0.5rem;
  }
`

const LanguageTag = styled.span`
  background-color: #2c5282;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 1rem;
  margin-left: 1rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const RelatedWords = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: #ebf8ff;
  border-radius: 0.75rem;
  color: #2c5282;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  p {
    margin: 0;
    line-height: 1.6;
    font-size: 1.1rem;
  }

  strong {
    color: #2a4365;
    font-weight: 600;
    font-size: 1.2rem;
  }

  p:last-child {
    margin-top: 0.75rem;
    color: #4a5568;
    background-color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
`

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
  
  h2 {
    color: #dc3545;
    margin-bottom: 1rem;
    font-size: 2rem;
    font-weight: 700;
  }
  
  p {
    font-size: 1.2rem;
    color: #4a5568;
    margin-bottom: 2rem;
  }
  
  button {
    margin-top: 1rem;
    padding: 1rem 2rem;
    background-color: #2c5282;
    color: white;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    &:hover {
      background-color: #2a4365;
      transform: translateY(-1px);
    }
  }
`

type SearchType = 'normal' | 'prefix' | 'suffix' | 'infix' | 'near' | 'random' | 'wotd'

interface DicionarioAbertoEntry {
  word: string;
  sense: number;
  xml: string;
  preview?: string;
}

interface WordOfTheDay {
  word_id: string;
  xml: string;
}

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
        const wotd = response.data as WordOfTheDay
        const { definition, grammarClass } = this.parseXMLContent(wotd.xml)
        return [{
          word: definition,
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

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <h2>Algo deu errado!</h2>
          <p>Desculpe pelo inconveniente. Por favor, tente novamente.</p>
          <button onClick={() => window.location.reload()}>Recarregar Página</button>
        </ErrorContainer>
      );
    }

    return this.props.children;
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

    // Se for palavra do dia, limpa o input
    if (searchType === 'wotd') {
      setWord('')
    }

    await dictionarySearch.search(word, searchType);
  }

  return (
    <Container>
      <Title>Dicionário</Title>
      <SearchContainer>
        <ButtonGroup>
          <SearchTypeButton 
            active={searchType === 'normal'} 
            onClick={() => setSearchType('normal')}
          >
            Normal
          </SearchTypeButton>
          <SearchTypeButton 
            active={searchType === 'prefix'} 
            onClick={() => setSearchType('prefix')}
          >
            Prefixo
          </SearchTypeButton>
          <SearchTypeButton 
            active={searchType === 'suffix'} 
            onClick={() => setSearchType('suffix')}
          >
            Sufixo
          </SearchTypeButton>
          <SearchTypeButton 
            active={searchType === 'infix'} 
            onClick={() => setSearchType('infix')}
          >
            Contém
          </SearchTypeButton>
          <SearchTypeButton 
            active={searchType === 'near'} 
            onClick={() => setSearchType('near')}
          >
            Similares
          </SearchTypeButton>
          <SearchTypeButton 
            active={searchType === 'random'} 
            onClick={() => {
              setSearchType('random')
              setWord('')
            }}
          >
            Aleatória
          </SearchTypeButton>
          <SearchTypeButton 
            active={searchType === 'wotd'} 
            onClick={() => {
              setSearchType('wotd')
              setWord('')
              searchWord()
            }}
          >
            Palavra do Dia
          </SearchTypeButton>
        </ButtonGroup>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {searchType !== 'random' && searchType !== 'wotd' && (
            <SearchInput
              placeholder="Digite uma palavra..."
              value={word}
              onChange={(e) => setWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchWord()}
            />
          )}
          
          <SearchButton
            onClick={searchWord}
            disabled={loading}
          >
            {loading ? 'Pesquisando...' : 'Pesquisar'}
          </SearchButton>
        </div>
      </SearchContainer>

      <ResultsContainer>
        {nearWords.length > 0 && searchType === 'near' && (
          <WordCard>
            <WordTitle>
              Palavras similares a "{word}"
              <LanguageTag>PT</LanguageTag>
            </WordTitle>
            <RelatedWords>
              <p><strong>Palavras encontradas:</strong></p>
              <p>{nearWords.join(', ')}</p>
            </RelatedWords>
          </WordCard>
        )}

        {dicionarioAbertoDefinitions.length > 0 && (
          <WordCard>
            <WordTitle>
              {dicionarioAbertoDefinitions[0].word}
              <LanguageTag>PT</LanguageTag>
            </WordTitle>
            {dicionarioAbertoDefinitions.map((entry, index) => {
              const { definition, grammarClass } = dictionarySearch.parseXMLContent(entry.xml)
              return (
                <div key={index}>
                  {grammarClass && <PartOfSpeech>{grammarClass}</PartOfSpeech>}
                  <Definition>
                    <p>
                      <strong>Definição {entry.sense}:</strong> {entry.preview || definition}
                    </p>
                  </Definition>
                </div>
              )
            })}
            {nearWords.length > 0 && searchType !== 'near' && (
              <RelatedWords>
                <p><strong>Palavras relacionadas:</strong></p>
                <p>{nearWords.join(', ')}</p>
              </RelatedWords>
            )}
          </WordCard>
        )}

        {definitions.map((entry, index) => (
          <WordCard key={index}>
            <WordTitle>
              {entry.word}
              <LanguageTag>EN</LanguageTag>
            </WordTitle>
            {entry.phonetic && (
              <Phonetic>Fonética: {entry.phonetic}</Phonetic>
            )}

            {entry.meanings.map((meaning, mIndex) => (
              <div key={mIndex}>
                <PartOfSpeech>{meaning.partOfSpeech}</PartOfSpeech>
                <div>
                  {meaning.definitions.map((def, dIndex) => (
                    <Definition key={dIndex}>
                      <p>
                        <strong>Definição:</strong> {def.definition}
                      </p>
                      {def.example && (
                        <p style={{ color: '#4a5568', marginTop: '0.25rem' }}>
                          <strong>Exemplo:</strong> "{def.example}"
                        </p>
                      )}
                    </Definition>
                  ))}
                </div>
              </div>
            ))}
          </WordCard>
        ))}
      </ResultsContainer>
    </Container>
  )
}

// Wrapper Component
function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWrapper;
