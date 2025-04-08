export interface Phonetic {
  text: string;
  audio?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  origin?: string;
  meanings: Meaning[];
}

export interface DictionaryError {
  title: string;
  message: string;
  resolution: string;
} 