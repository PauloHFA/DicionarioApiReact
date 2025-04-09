// Subject Interface
export interface Subject {
  addObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notifyObservers(data: any): void;
}

// Observer Interface
export interface Observer {
  update(data: any): void;
}

// Concrete Subject
export class DictionarySubject implements Subject {
  private observers: Observer[] = [];
  private loading: boolean = false;

  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notifyObservers(data: any): void {
    this.observers.forEach(observer => observer.update(data));
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
    this.notifyObservers({ type: 'loading', value: loading });
  }

  isLoading(): boolean {
    return this.loading;
  }
} 