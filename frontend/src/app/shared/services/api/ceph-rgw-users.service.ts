/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type RgwUserKey = {
  user: string;
  access_key: string;
  secret_key: string;
};

export type RgwUser = {
  user_id: string;
  display_name: string;
  email: string;
  suspended: boolean;
  max_buckets: number;
  keys: Array<RgwUserKey>;
};

@Injectable({
  providedIn: 'root'
})
export class CephRgwUsersService {
  // private url = 'api/ceph/rgw';

  users: Array<RgwUser> = [
    {
      user_id: 'foo',
      display_name: 'foo bar',
      email: 'foo_bar@test.com',
      suspended: false,
      max_buckets: 10,
      keys: []
    },
    {
      user_id: 'aaa',
      display_name: 'aaa bbb',
      email: 'aaa_bbb@test.com',
      suspended: true,
      max_buckets: 100,
      keys: []
    },
    {
      user_id: 'bbb',
      display_name: 'bbb 2222',
      email: 'bbb@test.com',
      suspended: false,
      max_buckets: 0,
      keys: [
        {
          user: 'bbb',
          access_key: '11BS02LGFB6AL6H1ADMW',
          secret_key: 'vzCEkuryfn060dfee4fgQPqFrncKEIkh3ZcdOANY'
        }
      ]
    },
    {
      user_id: 'zzz',
      display_name: 'zzz 1111',
      email: 'zzz@test.com',
      suspended: false,
      max_buckets: -1,
      keys: []
    }
  ];

  constructor() {}

  public list(): Observable<RgwUser[]> {
    return of(this.users).pipe(delay(2));
  }

  public get(username: string): Observable<RgwUser> {
    const user: RgwUser | undefined = _.find(this.users, ['user_id', username]);
    return of(user!).pipe(delay(2));
  }

  public create(user: RgwUser): Observable<void> {
    const clonedUser = _.cloneDeep(user);
    this.users.push(clonedUser);
    return of(void 0);
  }

  public update(user: RgwUser): Observable<RgwUser> {
    const index = _.findIndex(this.users, ['user_id', user.user_id]);
    this.users[index] = _.cloneDeep(user);
    return of(this.users[index]).pipe(delay(2));
  }

  public delete(username: string): Observable<void> {
    this.users = _.remove(this.users, ['user_id', username]);
    return of(void 0);
  }
}
