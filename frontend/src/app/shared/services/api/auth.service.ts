/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthStorageService } from '~/app/shared/services/auth-storage.service';

export type LoginReply = {
  access_token: string;
  token_type: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = 'api/auth';

  constructor(private http: HttpClient, private authStorageService: AuthStorageService) {}

  public login(username: string, password: string): Observable<LoginReply> {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization
    const credentials = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const body = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('grant_type', 'password');
    return this.http.post<LoginReply>(`${this.url}/login`, body, { headers }).pipe(
      tap((resp: LoginReply) => {
        this.authStorageService.set(username);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, null).pipe(
      tap(() => {
        this.authStorageService.revoke();
        document.location.replace('');
      })
    );
  }
}
