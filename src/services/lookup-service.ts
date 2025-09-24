import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, tap } from 'rxjs';
import { LookupContract } from '../contracts/lookup-contract';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  lookups = signal<LookupContract[]>([])
  lookupsMap = computed(() => {
    return this.lookups().reduce((acc, item) => {
      acc[item.id] = item
      return acc
    }, {} as Record<string, LookupContract>)
  })
  private readonly http = inject(HttpClient)

  load(): Observable<LookupContract[]> {
    return this.http.get<LookupContract[]>(environment.BASE_URL + '/lookups').pipe(tap(lookups => this.lookups.set(lookups)))
  }
}
