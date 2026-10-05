import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly _loading = signal(false);
  private readonly _loadingText = signal('');

  readonly loading = this._loading.asReadonly();
  readonly loadingText = this._loadingText.asReadonly();

  show(text: string = ''): void {
    this._loadingText.set(text);
    this._loading.set(true);
  }

  hide(): void {
    this._loading.set(false);
  }
}
