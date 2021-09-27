/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface HealthCheckSummary {
  message: string;
  count: number;
}

export interface HealthStatus {
  status: string;
  checks: { [id: string]: HealthCheckSummary };
}

export interface ClusterStatus {
  fsid: string;
  /* eslint-disable @typescript-eslint/naming-convention */
  election_epoch: number;
  quorum: number[];
  quorum_names: string[];
  quorum_age: number;
  health: HealthStatus;
}

export type Status = {
  cluster?: ClusterStatus;
  dashboard_url?: string;
};

export type IORate = {
  read: number;
  write: number;
  read_ops: number;
  write_ops: number;
};

export type ServiceIO = {
  service_name: string;
  service_type: string;
  io_rate: IORate;
};

export type ClientIO = {
  cluster: IORate;
  services: ServiceIO[];
};

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private url = 'api/status';

  constructor(private http: HttpClient) {}

  /**
   * Get the current status.
   */
  status(): Observable<Status> {
    return this.http.get<Status>(`${this.url}/`);
  }

  clientIO(): Observable<ClientIO> {
    return this.http.get<ClientIO>(`${this.url}/client-io-rates`);
  }
}
