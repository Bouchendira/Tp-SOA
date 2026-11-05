import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

/**
 * PROTOTYPE DATA LAYER.
 *
 * Simulates a backend repository: loads seed data once from a static
 * JSON file under assets/data/, then keeps everything in memory for the
 * rest of the session (changes are NOT persisted - a page refresh
 * resets to the seed data). This mirrors the shape of the real Spring
 * Boot services (getAll/getById/create/update/delete) so that swapping
 * this out for real HttpClient calls to the backend later is a
 * mechanical change, not a redesign: replace the body of each method
 * with the matching this.http.get/post/put/delete call to the real API
 * and keep the same public method signatures used by the components.
 *
 * A small artificial delay is added to network-like calls so the UI's
 * loading states behave the way they will against a real API.
 */
export abstract class MockCrudService<T extends { id: string }> {
  protected dataSubject = new BehaviorSubject<T[]>([]);
  readonly data$ = this.dataSubject.asObservable();
  private loaded = false;

  protected constructor(protected http: HttpClient, protected jsonUrl: string) {}

  /** Loads the seed data once. Safe to call multiple times. */
  load(): Observable<T[]> {
    if (this.loaded) {
      return of(this.dataSubject.value);
    }
    return this.http.get<T[]>(this.jsonUrl).pipe(
      tap((data) => {
        this.dataSubject.next(data);
        this.loaded = true;
      })
    );
  }

  getAll(): T[] {
    return this.dataSubject.value;
  }

  getById(id: string): T | undefined {
    return this.dataSubject.value.find((item) => item.id === id);
  }

  create(item: T): Observable<T> {
    this.dataSubject.next([...this.dataSubject.value, item]);
    return of(item).pipe(delay(150));
  }

  update(id: string, changes: Partial<T>): Observable<T | undefined> {
    let updated: T | undefined;
    const next = this.dataSubject.value.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...changes };
        return updated;
      }
      return item;
    });
    this.dataSubject.next(next);
    return of(updated).pipe(delay(150));
  }

  delete(id: string): Observable<void> {
    this.dataSubject.next(this.dataSubject.value.filter((item) => item.id !== id));
    return of(void 0).pipe(delay(150));
  }

  /** Generates a mock id. The real backend generates a UUID server-side. */
  protected generateId(prefix: string): string {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
}
