import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, shareReplay, switchMap, tap } from 'rxjs/operators';

export abstract class ApiCrudService<T extends { id: string }> {
  protected dataSubject = new BehaviorSubject<T[]>([]);
  readonly data$ = this.dataSubject.asObservable();
  private loaded = false;
  private loading?: Observable<T[]>;

  protected constructor(protected http: HttpClient, protected endpoint: string) {}

  load(): Observable<T[]> {
    if (this.loaded) {
      return of(this.dataSubject.value);
    }

    if (!this.loading) {
      this.loading = this.fetchAll().pipe(
        finalize(() => (this.loading = undefined)),
        shareReplay(1)
      );
    }
    return this.loading;
  }

  refresh(): Observable<T[]> {
    return this.fetchAll();
  }

  getAll(): T[] {
    return this.dataSubject.value;
  }

  getById(id: string): T | undefined {
    return this.dataSubject.value.find((item) => item.id === id);
  }

  create(item: Omit<T, 'id'>): Observable<T> {
    return this.createRequest(this.toRequest(item));
  }

  update(id: string, changes: Partial<T>): Observable<T> {
    const current = this.getById(id);
    const current$ = current ? of(current) : this.http.get<T>(`${this.endpoint}/${id}`);

    return current$.pipe(
      tap((item) => this.upsert(item)),
      // PUT endpoints accept complete request DTOs, so merge edits with the loaded record.
      // The detail GET above also supports updates when the list cache has not been loaded.
      switchMap((item) => this.http.put<T>(`${this.endpoint}/${id}`, this.toRequest({ ...item, ...changes }))),
      tap((updated) => this.upsert(updated))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => this.dataSubject.next(this.dataSubject.value.filter((item) => item.id !== id)))
    );
  }

  protected createRequest(request: unknown): Observable<T> {
    return this.http.post<T>(this.endpoint, request).pipe(tap((item) => this.upsert(item)));
  }

  protected patchRequest(id: string, path: string, request: unknown): Observable<T> {
    return this.http.patch<T>(`${this.endpoint}/${id}/${path}`, request).pipe(tap((item) => this.upsert(item)));
  }

  protected postRequest(id: string, path: string): Observable<T> {
    return this.http.post<T>(`${this.endpoint}/${id}/${path}`, {}).pipe(tap((item) => this.upsert(item)));
  }

  protected upsert(item: T): void {
    const items = this.dataSubject.value;
    const index = items.findIndex((existing) => existing.id === item.id);
    const next = [...items];
    if (index === -1) {
      next.push(item);
    } else {
      next[index] = item;
    }
    this.dataSubject.next(next);
  }

  updateLocal(id: string, changes: Partial<T>): void {
    const item = this.getById(id);
    if (item) {
      this.upsert({ ...item, ...changes });
    }
  }

  protected toRequest(item: T | Omit<T, 'id'>): unknown {
    return Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'id'));
  }

  private fetchAll(): Observable<T[]> {
    return this.http.get<T[]>(this.endpoint).pipe(
      tap((items) => {
        this.dataSubject.next(items);
        this.loaded = true;
      })
    );
  }
}
