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
  });

  public backends: { [id: string]: string[] } = {
    file: [ "nfs", "cephfs" ],
    block: [ "rbd", "iscsi" ],
    object: [ "rgw" ],
  };

  public constructor(private fb: FormBuilder) { }

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

}
