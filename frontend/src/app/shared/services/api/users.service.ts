/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type User = {
  username: string;
  password: string;
  full_name: string;
  disabled: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private url = 'api/users';

  constructor(private http: HttpClient) {}

  public list(): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}/`);
  }
}
