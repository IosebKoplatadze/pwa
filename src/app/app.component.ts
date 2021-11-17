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
  needSync = false;
  isOnline = true;

  constructor(private client: HttpClient) {}

  ngOnInit(): void {
    this.updateOnlineStatus();
    window.addEventListener('online', () => this.updateOnlineStatus);
    window.addEventListener('offline', () => this.updateOnlineStatus);

    this.client
      .get<any>('api/todos')
      .pipe(
        finalize(() => {
          console.log('todos = ', this.todos);
          this.loading = false;
        })
      )
      .subscribe(
        (todos) => {
          console.log('get data from api');
          const cachedData = this.cachedData;
          this.needSync = cachedData && !isEqual(cachedData, todos);
          this.todos = this.needSync ? cachedData : todos;
        },
        () => {
          this.todos = this.cachedData;
          console.log('get data from storage');
        }
      );
  }

  onSave(): void {
    this.loading = true;
    // if (this.isOnline) {
    // this.client
    //   .post<any>('api/todos', this.todos)
    //   .pipe(
    //     finalize(() => {
    //       console.log('todos = ', this.todos);
    //       this.cacheData();
    //       this.loading = false;
    //     })
    //   )
    //   .subscribe(() => {
    //     this.needSync = false;
    //   });
    // } else
    if ((window as any).flutter_inappwebview) {
      (window as any).flutter_inappwebview
        .callHandler('passData', this.todos)
        ?.then(() => {
          this.loading = false;
        });
    }
  }

  private get cachedData(): any {
    return JSON.parse(localStorage.getItem('todos') ?? 'null');
  }

  private cacheData(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  private updateOnlineStatus(): void {
    this.isOnline = navigator.onLine;
  }
}
