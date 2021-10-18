import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { EMPTY, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { catchError, delay, filter, repeat, switchMap, tap } from 'rxjs/operators';

import { ClusterService, ClusterStatus } from '~/app/shared/services/api/cluster.service';

@Injectable({
  providedIn: 'root'
})
export class ClusterStatusService implements OnDestroy {
  public readonly status$: Observable<ClusterStatus>;

  private subscription: Subscription;
  private statusSource = new ReplaySubject<ClusterStatus>(1);

  constructor(private router: Router, private clusterService: ClusterService) {
    this.status$ = this.statusSource.asObservable();
    this.subscription = of(true)
      .pipe(
        filter(() => this.router.url !== '/login'),
        switchMap(() =>
          this.clusterService.status().pipe(
            catchError((error) => {
              // Forward error to subscribers.
              this.statusSource.error(error);
              // Prevent default error handling.
              if (_.isFunction(error.preventDefault)) {
                error.preventDefault();
              }
              return EMPTY;
            })
          )
        ),
        tap((res: ClusterStatus) => {
          this.statusSource.next(res);
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
