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

export type PGState = {
  state_name: string;
  count: number;
};

export type PGMap = {
  pgs_by_state: PGState[];
  num_pgs: number;
  num_pools: number;
  num_objects: number;
  // storage statistics
  data_bytes: number;
  bytes_used: number;
  bytes_avail: number;
  bytes_total: number;
  // pg statistics
  inactive_pgs_ratio: number;
  degraded_objects: number;
  degraded_total: number;
  degraded_ratio: number;
  // client io
  read_bytes_sec: number;
  write_bytes_sec: number;
  read_op_per_sec: number;
  write_op_per_sec: number;
};

export type ClusterStatus = {
  fsid: string;
  election_epoch: number;
  quorum: number[];
  quorum_names: string[];
  quorum_age: number;
  health: HealthStatus;
  pgmap: PGMap;
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
