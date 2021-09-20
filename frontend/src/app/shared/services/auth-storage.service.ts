import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AuthStorageService {
  constructor() {}

  set(username: string): void {
    localStorage.setItem('username', username);
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  revoke(): void {
    localStorage.removeItem('username');
  }

  isLoggedIn() {
    return !_.isNull(this.getUsername());
  }
}
