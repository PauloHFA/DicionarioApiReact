import styled from '@emotion/styled'
import { DictionaryEntry, DicionarioAbertoEntry } from '../types/dictionary'

const Card = styled.div`
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

interface WordCardProps {
  entry: DictionaryEntry | DicionarioAbertoEntry;
  type: 'en' | 'pt';
  nearWords?: string[];
  parseXMLContent?: (xml: string) => { definition: string; grammarClass: string };
}

export function WordCard({ entry, type, nearWords, parseXMLContent }: WordCardProps) {
  if (type === 'en') {
    const enEntry = entry as DictionaryEntry;
    return (
      <Card>
        <WordTitle>
          {enEntry.word}
          <LanguageTag>EN</LanguageTag>
        </WordTitle>
        {enEntry.phonetic && (
          <Phonetic>Fonética: {enEntry.phonetic}</Phonetic>
        )}

        {enEntry.meanings.map((meaning, mIndex) => (
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
      </Card>
    );
  }

  const ptEntry = entry as DicionarioAbertoEntry;
  const { definition, grammarClass } = parseXMLContent?.(ptEntry.xml) || { definition: '', grammarClass: '' };

  return (
    <Card>
      <WordTitle>
        {ptEntry.word}
        <LanguageTag>PT</LanguageTag>
      </WordTitle>
      {grammarClass && <PartOfSpeech>{grammarClass}</PartOfSpeech>}
      <Definition>
        <p>
          <strong>Definição {ptEntry.sense}:</strong> {ptEntry.preview || definition}
        </p>
      </Definition>
      {nearWords && nearWords.length > 0 && (
        <RelatedWords>
          <p><strong>Palavras relacionadas:</strong></p>
          <p>{nearWords.join(', ')}</p>
        </RelatedWords>
      )}
    </Card>
  );
} 