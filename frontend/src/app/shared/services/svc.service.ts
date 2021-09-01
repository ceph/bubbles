/*
 * bubbles - a simplified management UI for Ceph
 * Copyright (C) 2021 SUSE, LLC
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 */
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";


export declare type ServiceInfo = {
  name: string,
  size: number,
  replicas: number,
  type: "file" | "object" | "block",
  backend: string,
};

export declare type ServiceListReply = {
  allocated: number,
  services: ServiceInfo[],
  status: {[id: string]: ServiceStatus},
};

export declare type ServiceStatusCode = "undefined" | "dne";

export declare type ServiceStatusEnum = number;

export declare type ServiceStatusInfo = {
  code: ServiceStatusCode,
  msg: string,
};

export declare type ServiceStatus = {
  name: string,
  status: ServiceStatusEnum,
  info: ServiceStatusInfo[],
};


@Injectable({
  providedIn: "root"
})
export class SvcService {

  private url: string = "/api/services"

  public constructor(private http: HttpClient) { }

  public create(info: ServiceInfo): Observable<boolean> {
    return new Observable((observer) => {
      this.http.post<boolean>(`${this.url}/create`, info)
        .subscribe({
          next: (res: boolean) => {
            observer.next(res);
          },
          error: (err: HttpErrorResponse) => {
            observer.error(err.statusText);
          },
        });
    });
  }

  public list(): Observable<ServiceListReply> {
    return this.http.get<ServiceListReply>(`${this.url}/list`);
  }
}
