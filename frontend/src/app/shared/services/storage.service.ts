/*
 * bubbles - a simplified management UI for Ceph
 * Copyright (C) 2021 SUSE, LLC
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export declare type StorageStatsReply = {
  total: number;
  available: number;
  allocated: number;
  unallocated: number;
};

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private url = '/api/storage';

  public constructor(private http: HttpClient) {}

  public stats(): Observable<StorageStatsReply> {
    return this.http.get<StorageStatsReply>(`${this.url}/stats`);
  }
}
