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
import { FormBuilder, Validators } from "@angular/forms";
import { ServiceInfo, SvcService } from "src/app/shared/services/svc.service";

@Component({
  selector: "bubbles-services-create",
  templateUrl: "./services-create.component.html",
  styleUrls: ["./services-create.component.scss"]
})
export class ServicesCreateComponent implements OnInit {

  public createForm = this.fb.group({
    name: [ "", Validators.required ],
    size: [ 0, Validators.required ],
    replicas: [ 3, Validators.required ],
    type: [ "", Validators.required ],
    backend: [ "", Validators.required ],
  });

  public backends: { [id: string]: string[] } = {
    file: [ "nfs", "cephfs" ],
    block: [ "rbd", "iscsi" ],
    object: [ "rgw" ],
  };

  public isError: boolean = false;
  public isSuccess: boolean = false;
  public errorMsg: string = "";

  public constructor(
    private fb: FormBuilder, private svcService: SvcService
  ) { }

  public ngOnInit(): void {
  }

  public getSelectedType(): string {
    const type = this.createForm.get("type")?.value;
    if (!type) {
      return "";
    }
    return type;
  }

  public getBackendOptions(): string[] {
    const type = this.getSelectedType();
    if (type === "") {
      return [];
    }
    return this.backends[type];
  }

  public submitForm(): void {

    const name = this.createForm.get("name")?.value;
    const size = this.createForm.get("size")?.value;
    const replicas = this.createForm.get("replicas")?.value;
    const type = this.createForm.get("type")?.value;
    const backend = this.createForm.get("backend")?.value;

    if (!name || !size || !replicas || !type || !backend) {
      console.error("Missing form field");
      return;
    }

    const info: ServiceInfo = {
      name: name,
      size: size,
      replicas: replicas,
      type: type,
      backend: backend,
    };

    this.svcService.create(info)
      .subscribe({
        next: (res: boolean) => {
          if (!res) {
            this.showError("unknown");
            return;
          }
          this.createForm.reset();
          this.showSuccess();
        },
        error: (err: string) => {
          this.showError(err);
        }
      });
  }

  public showError(msg: string): void {
    this.isSuccess = false;
    this.isError = true;
    this.errorMsg = msg;
  }

  public showSuccess(): void {
    this.isError = false;
    this.isSuccess = true;
  }
}
