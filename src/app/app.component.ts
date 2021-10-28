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

  constructor(private client: HttpClient) {}

  ngOnInit(): void {
    this.client
      .get<any>('http://localhost:8080/todos')
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
    this.client
      .post<any>('http://localhost:8080/todos', this.todos)
      .pipe(
        finalize(() => {
          console.log('todos = ', this.todos);
          this.cacheData();
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.needSync = false;
      });
  }

  private get cachedData(): any {
    return JSON.parse(localStorage.getItem('todos') ?? 'null');
  }

  private cacheData(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
}
