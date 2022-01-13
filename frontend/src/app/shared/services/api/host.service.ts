/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type Service = {
  type: string;
  id: string;
};

export type HostSources = {
  ceph: boolean;
  orchestrator: boolean;
};

export type Host = {
  hostname: string;
  services: Array<Service>;
  ceph_version: string;
  addr: string;
  labels: Array<string>;
  service_type?: string;
  status: string;
  sources: HostSources;
};

@Injectable({
  providedIn: 'root'
})
export class HostService {
  private url = 'api/host';

  constructor(private http: HttpClient) {}

  public list(): Observable<Host[]> {
    return this.http.get<Host[]>(`${this.url}/`);
  }
}
