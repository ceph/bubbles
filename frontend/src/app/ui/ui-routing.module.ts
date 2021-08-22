/*
 * bubbles - a simplified management UI for Ceph
 * Copyright (C) 2021 SUSE, LLC
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServicesCreateComponent } from './services/services-create/services-create.component';
import { ServicesListComponent } from './services/services-list/services-list.component';

const routes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  {
    path: "services",
    children: [
      { path: "list", component: ServicesListComponent },
      { path: "create", component: ServicesCreateComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UiRoutingModule { }
