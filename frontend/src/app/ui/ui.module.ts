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
import { CommonModule } from '@angular/common';

import { UiRoutingModule } from './ui-routing.module';
import { MainComponent } from './main/main.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ServicesListComponent } from './services/services-list/services-list.component';
import { ServicesCreateComponent } from './services/services-create/services-create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    MainComponent,
    DashboardComponent,
    ServicesListComponent,
    ServicesCreateComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiRoutingModule,
    NgbCollapseModule,
    HttpClientModule,
  ]
})
export class UiModule { }
