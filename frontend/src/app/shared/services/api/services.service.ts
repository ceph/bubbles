import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';

export interface Requirements {
  allocated: number;
  available: number;
  required: number;
}

export interface AllocationConstraints {
  allocated: number;
  available: number;
}

export interface RedundancyConstraints {
  /* eslint-disable @typescript-eslint/naming-convention */
  max_replicas: number;
}

export interface AvailabilityConstraints {
  hosts: number;
}

export interface Constraints {
  allocations: AllocationConstraints;
  redundancy: RedundancyConstraints;
  availability: AvailabilityConstraints;
}

export declare type ServiceType = 'file' | 'object' | 'block';
export declare type ServiceBackend = 'cephfs' | 'nfs' | 'rbd' | 'iscsi' | 'rgw';

export interface CreateServiceRequest {
  name: string;
  type: ServiceType;
  size: number;
  replicas: number;
}

export interface ServiceInfo {
  name: string;
  size: number;
  replicas: number;
  type: ServiceType;
  backend: ServiceBackend;
}

export type ServiceStorage = {
  name: string;
  used: number;
  avail: number;
  allocated: number;
  utilization: number;
};

export enum ServiceStatusCode {
  OKAY = 0,
  WARN = 5,
  ERROR = 10,
  NONE = 20
}

export type ServiceStatusInfo = {
  code: number;
  msg: string;
};

export type ServiceStatus = {
  name: string;
  status: ServiceStatusCode;
  info: Array<any>;
};

export type Services = {
  allocated: number;
  services: Array<ServiceInfo>;
  status: Record<string, ServiceStatus>;
};

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  private url = 'api/services';

  constructor(private http: HttpClient) {}

  public create(serviceInfo: ServiceInfo): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}/create`, serviceInfo);
  }

  public list(): Observable<Services> {
    return this.http.get<Services>(`${this.url}/`);
  }

  public exists(service_name: string): Observable<boolean> {
    return this.http.get<ServiceInfo>(`${this.url}/${service_name}`).pipe(
      mapTo(true),
      catchError((error) => {
        error.preventDefault();
        return of(false);
      })
    );
  }
}
