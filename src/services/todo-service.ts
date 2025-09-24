import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TodoContract } from '../contracts/todo-contract';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  URL = environment.BASE_URL
  private readonly http = inject(HttpClient);

  load(): Observable<TodoContract[]> {
    return this.http.get<TodoContract[]>(this.URL + '/todos')
  }

  create(todo: Partial<TodoContract>): Observable<TodoContract> {
    delete todo.id;
    return this.http.post<TodoContract>(this.URL + '/todos', todo)
  }

  update(todo: Partial<TodoContract>): Observable<TodoContract> {
    return this.http.put<TodoContract>(this.URL + '/todos', todo)
  }

  delete(todo: TodoContract): Observable<void> {
    return this.http.delete<void>(this.URL + '/todos/' + todo.id)
  }
}
