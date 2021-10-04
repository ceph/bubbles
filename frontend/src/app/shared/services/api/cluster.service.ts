/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type ClusterUsageStats = Record<string, any>;

export type HealthCheckSummary = {
  message: string;
  count: number;
};

export type HealthCheck = {
  severity: string;
  summary: HealthCheckSummary;
  muted: boolean;
};

export type HealthStatus = {
  status: string;
  checks: { [id: string]: HealthCheck };
};

export type ClusterStatus = {
  fsid: string;
  election_epoch: number;
  quorum: number[];
  quorum_names: string[];
  quorum_age: number;
  health: HealthStatus;
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

export type Event = {
  ts: number;
  severity: string;
  message: string;
};

@Injectable({
  providedIn: 'root'
})
export class ClusterService {
  private url = 'api/cluster';

  constructor(private http: HttpClient) {}

  df(): Observable<ClusterUsageStats> {
    return this.http.get<ClusterUsageStats>(`${this.url}/df`);
  }

  status(): Observable<ClusterStatus> {
    return this.http.get<ClusterStatus>(`${this.url}/status`);
  }

  clientIO(): Observable<ClientIO> {
    return this.http.get<ClientIO>(`${this.url}/client-io-rates`);
  }

  events(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.url}/events`);
  }
}
