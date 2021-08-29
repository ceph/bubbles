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
import { ServiceInfo, ServiceListReply, SvcService } from "src/app/shared/services/svc.service";

@Component({
  selector: "bubbles-services-list",
  templateUrl: "./services-list.component.html",
  styleUrls: ["./services-list.component.scss"]
})
export class ServicesListComponent implements OnInit {

  public services: ServiceInfo[] = [];
  public allocated: number = 0;

  public constructor(private svcService: SvcService) { }

  public ngOnInit(): void {
    this.svcService.list().subscribe({
      next: (svcs: ServiceListReply) => {
        console.log(svcs);
        this.services = svcs.services;
        this.allocated = svcs.allocated;
      }
    });
  }

  public hasServices(): boolean {
    return this.services.length > 0;
  }
}
