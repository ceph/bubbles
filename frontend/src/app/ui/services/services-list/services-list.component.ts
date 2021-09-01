/*
 * bubbles - a simplified management UI for Ceph
 * Copyright (C) 2021 SUSE, LLC
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 */
import { Component, OnInit } from "@angular/core";
import { interval } from "rxjs";
import { StorageService, StorageStatsReply } from "src/app/shared/services/storage.service";
import {
  ServiceInfo,
  ServiceListReply,
  ServiceStatus,
  SvcService,
} from "src/app/shared/services/svc.service";

@Component({
  selector: "bubbles-services-list",
  templateUrl: "./services-list.component.html",
  styleUrls: ["./services-list.component.scss"]
})
export class ServicesListComponent implements OnInit {

  public services: ServiceInfo[] = [];
  public allocated: number = 0;
  public unallocated: number = 0;
  public statusPerService: {[id: string]: ServiceStatus} = {};
  public globalStatus: number = 0;

  public constructor(
    private svcService: SvcService, private storageService: StorageService
  ) { }

  public ngOnInit(): void {
    this.svcService.list().subscribe({
      next: (svcs: ServiceListReply) => {
        console.log(svcs);
        this.services = svcs.services;
        this.allocated = svcs.allocated;
        this.statusPerService = svcs.status;
        this.defineGlobalStatus();
      }
    });
    this.getStats();
    interval(5000).subscribe({
      next: () => this.getStats()
    });
  }

  public hasServices(): boolean {
    return this.services.length > 0;
  }

  public getServiceStatus(svcname: string): string {
    if (!(svcname in this.statusPerService)) {
      return "unknown";
    }
    return this.statusToStr(this.statusPerService[svcname].status);
  }

  public getGlobalStatus(): string {
    return this.statusToStr(this.globalStatus);
  }

  public isErrorStatus(code: number): boolean {
    return (code >= 10);
  }

  public isWarnStatus(code: number): boolean {
    return (code === 5);
  }

  public isOkayStatus(code: number): boolean {
    return (code === 0);
  }

  public isServiceError(svcname: string): boolean {
    const status: number = this.statusPerService[svcname].status;
    return this.isErrorStatus(status);
  }

  public isServiceWarn(svcname: string): boolean {
    const status: number = this.statusPerService[svcname].status;
    return this.isWarnStatus(status);
  }

  public isServiceOkay(svcname: string): boolean {
    const status: number = this.statusPerService[svcname].status;
    return this.isOkayStatus(status);
  }

  public isGlobalError(): boolean {
    return this.isErrorStatus(this.globalStatus);
  }

  public isGlobalWarn(): boolean {
    return this.isWarnStatus(this.globalStatus);
  }

  public isGlobalOkay(): boolean {
    return this.isOkayStatus(this.globalStatus);
  }

  private getStats(): void {
    this.storageService.stats().subscribe({
      next: (stats: StorageStatsReply) => {
        this.unallocated = stats.unallocated;
      }
    });
  }

  private statusToStr(code: number): string {
    let str: string = "unknown";
    switch (code) {
      case 0:
        str = "okay"        
        break;
      case 5:
        str = "warning";
        break;
      case 10:
        str = "error";
        break;
      case 20:
        str = "none";
        break;
      default:
        break;
    }
    return str;
  }

  private defineGlobalStatus(): void {
    let worst: number = 0;
    Object.values(this.statusPerService).forEach((item: ServiceStatus) => {
      const status: number = item.status;
      if (status > worst) {
        worst = status;
      }
    });
    this.globalStatus = worst;
  }
}
