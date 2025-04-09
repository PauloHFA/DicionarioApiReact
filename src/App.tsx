import { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { DictionaryEntry, DicionarioAbertoEntry, SearchType } from './types/dictionary'
import { SearchBar } from './components/SearchBar'
import { WordCard } from './components/WordCard'
import { DictionaryService } from './services/DictionaryService'
import { Observer } from './patterns/Observer'

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

function App() {
  const [word, setWord] = useState('')
  const [searchType, setSearchType] = useState<SearchType>('normal')
  const [definitions, setDefinitions] = useState<DictionaryEntry[]>([])
  const [dicionarioAbertoDefinitions, setDicionarioAbertoDefinitions] = useState<DicionarioAbertoEntry[]>([])
  const [nearWords, setNearWords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const dictionaryService = DictionaryService.getInstance();

  useEffect(() => {
    // Criar o observer
    const dictionaryObserver: Observer = {
      update: (data: any) => {
        switch (data.type) {
          case 'loading':
            setLoading(data.value);
            break;
          case 'english':
            setDefinitions(data.value);
            break;
          case 'dicionarioAberto':
            setDicionarioAbertoDefinitions(data.value);
            break;
          case 'near':
            setNearWords(data.value || []);
            break;
          case 'error':
            console.error('Erro na busca:', data.value);
            break;
        }
      }
    };

    // Registrar o observer
    dictionaryService.addObserver(dictionaryObserver);

    // Limpar o observer quando o componente for desmontado
    return () => {
      dictionaryService.removeObserver(dictionaryObserver);
    };
  }, []);

  const searchWord = async () => {
    if (!word.trim() && searchType !== 'random' && searchType !== 'wotd') {
      alert('Por favor, digite uma palavra para pesquisar')
      return
    }
    await dictionaryService.search(word, searchType);
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
            parseXMLContent={dictionaryService.parseXMLContent}
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
