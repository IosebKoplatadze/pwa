import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { isEqual } from 'lodash-es';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  keys = Object.keys;
  todos: any;
  loading = true;
  isOnline = true;

  constructor(private client: HttpClient) {}

  ngOnInit(): void {
    this.updateOnlineStatus();
    window.addEventListener('online', async () => {
      this.updateOnlineStatus();
      this.onSave();
    });
    window.addEventListener('offline', () => this.updateOnlineStatus());

    this.getData();
  }

  private getData(): void {
    const updateDataFromCache = async () => {
      this.todos = await this.cachedData;
      this.loading = false;
      console.log('get data from storage', this.todos);
    };
    if (this.isOnline) {
      this.client
        .get<any>('api/todos')
        .pipe(
          finalize(() => {
            console.log('todos = ', this.todos);
            this.loading = false;
          })
        )
        .subscribe(async (todos) => {
          console.log('get data from api');
          const cachedData = await this.cachedData;
          const needSync = cachedData && !isEqual(cachedData, todos);
          this.todos = needSync ? cachedData : todos;
          if (needSync) {
            this.onSave();
          }
        }, updateDataFromCache);
    } else {
      updateDataFromCache();
    }
  }

  async onSave() {
    this.loading = true;
    if (this.isOnline) {
      this.client
        .post<any>('api/todos', this.todos)
        .pipe(
          finalize(async () => {
            console.log('todos = ', this.todos);
            await this.cacheData();
            this.loading = false;
          })
        )
        .subscribe();
    } else {
      await this.cacheData();
      this.loading = false;
    }
  }

  private get cachedData(): Promise<any> {
    if ((window as any).flutter_inappwebview) {
      return (window as any).flutter_inappwebview.callHandler(
        'getDataFromStorage'
      );
    } else {
      return Promise.resolve(
        JSON.parse(localStorage.getItem('todos') ?? 'null')
      );
    }
  }

  private cacheData(): Promise<void> {
    if ((window as any).flutter_inappwebview) {
      return (window as any).flutter_inappwebview.callHandler(
        'passData',
        this.todos
      );
    } else {
      return Promise.resolve(
        localStorage.setItem('todos', JSON.stringify(this.todos))
      );
    }
  }

  private updateOnlineStatus(): void {
    this.isOnline = navigator.onLine;
  }
}
