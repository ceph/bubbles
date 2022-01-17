import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type CephFSCaps = {
  mds: string;
  mon: string;
  osd: string;
};

export type CephFSAuthorization = {
  entity: string;
  key: string;
  caps: CephFSCaps;
};

@Injectable({
  providedIn: 'root'
})
export class CephFsService {
  private url = 'api/ceph/fs';

  constructor(private http: HttpClient) {}

  public authorization(name: string): Observable<CephFSAuthorization> {
    return this.http.get<CephFSAuthorization>(`${this.url}/${name}/auth`);
  }
}
