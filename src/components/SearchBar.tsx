import styled from '@emotion/styled'
import { SearchType } from '../types/dictionary'

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

interface SearchBarProps {
  word: string;
  setWord: (word: string) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  loading: boolean;
  onSearch: () => void;
}

export function SearchBar({ word, setWord, searchType, setSearchType, loading, onSearch }: SearchBarProps) {
  return (
    <SearchContainer>
      <ButtonGroup>
        <SearchTypeButton 
          active={searchType === 'normal'} 
          onClick={() => setSearchType('normal')}
        >
          Busca Normal
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
          Infixo
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
            onSearch()
          }}
        >
          Aleatória
        </SearchTypeButton>
        <SearchTypeButton 
          active={searchType === 'wotd'} 
          onClick={() => {
            setSearchType('wotd')
            setWord('')
            onSearch()
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
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
        )}
        
        <SearchButton
          onClick={onSearch}
          disabled={loading}
        >
          {loading ? 'Pesquisando...' : 'Pesquisar'}
        </SearchButton>
      </div>
    </SearchContainer>
  )
} 