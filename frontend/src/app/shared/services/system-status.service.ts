import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { EMPTY, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { catchError, delay, filter, mergeMap, repeat, tap } from 'rxjs/operators';

import { Status, StatusService } from '~/app/shared/services/api/status.service';

export type SystemStatus = Status;

@Injectable({
  providedIn: 'root'
})
export class SystemStatusService implements OnDestroy {
  public readonly systemStatus$: Observable<SystemStatus>;

  private subscription: Subscription;
  private systemStatusSource = new ReplaySubject<SystemStatus>(1);

  constructor(private router: Router, private statusService: StatusService) {
    this.systemStatus$ = this.systemStatusSource.asObservable();
    this.subscription = of(true)
      .pipe(
        filter(() => this.router.url !== '/login'),
        mergeMap(() => this.statusService.status()),
        catchError((error) => {
          if (_.isFunction(error.preventDefault)) {
            error.preventDefault();
          }
          return EMPTY;
        }),
        tap((res: SystemStatus) => {
          this.systemStatusSource.next(res);
        }),
        delay(5000),
        repeat()
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
