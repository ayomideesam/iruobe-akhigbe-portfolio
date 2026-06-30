import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingTextSubject = new BehaviorSubject<string>('');

  loading$ = this.loadingSubject.asObservable();
  loadingText$ = this.loadingTextSubject.asObservable();

  show(text: string = '') {
    this.loadingTextSubject.next(text);
    this.loadingSubject.next(true);
  }

  hide() {
    this.loadingSubject.next(false);
  }
}