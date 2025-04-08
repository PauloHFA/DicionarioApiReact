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
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

export interface DictionaryError {
  title: string;
  message: string;
  resolution: string;
}

export interface DicionarioAbertoEntry {
  word: string;
  sense: number;
  xml: string;
  preview?: string;
}

export interface WordOfTheDay {
  word: string;
  xml: string;
}

export type SearchType = 'normal' | 'prefix' | 'suffix' | 'infix' | 'near' | 'random' | 'wotd'; 