/*
 * Project Aquarium's frontend (glass)
 * Copyright (C) 2021 SUSE, LLC.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
/* eslint-disable max-len */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { DashboardModule } from '~/app/core/dashboard/dashboard.module';
import { ServicesUtilizationDashboardWidgetComponent } from '~/app/core/dashboard/widgets/services-utilization-dashboard-widget/services-utilization-dashboard-widget.component';
import { Services } from '~/app/shared/services/api/services.service';
import { TestingModule } from '~/app/testing.module';

describe('ServicesUtilizationDashboardWidgetComponent', () => {
  let component: ServicesUtilizationDashboardWidgetComponent;
  let fixture: ComponentFixture<ServicesUtilizationDashboardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule, TranslateModule.forRoot(), TestingModule, BrowserAnimationsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesUtilizationDashboardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build series data [1]', () => {
    const services: Services = {
      allocated: 0,
      services: [],
      status: {}
    };
    expect(component.buildSeriesData(services)).toEqual([
      {
        children: [
          {
            children: [],
            name: 'RBD',
            value: 0
          },
          {
            children: [],
            name: 'iSCSI',
            value: 0
          }
        ],
        name: 'Block',
        value: 0
      },
      {
        children: [
          {
            children: [],
            name: 'CephFS',
            value: 0
          },
          {
            children: [],
            name: 'NFS',
            value: 0
          }
        ],
        name: 'File',
        value: 0
      },
      {
        children: [
          {
            children: [],
            name: 'RGW',
            value: 0
          }
        ],
        name: 'Object',
        value: 0
      }
    ]);
  });

  it('should build series data [2]', () => {
    const services: Services = {
      allocated: 0,
      services: [
        {
          name: 'test01',
          size: 75 * 1024 * 1024 * 1024,
          replicas: 2,
          type: 'file',
          backend: 'nfs'
        },
        {
          name: 'test02',
          size: 50 * 1024 * 1024 * 1024,
          replicas: 3,
          type: 'file',
          backend: 'cephfs'
        },
        {
          name: 'test03',
          size: 90 * 1024 * 1024 * 1024,
          replicas: 1,
          type: 'block',
          backend: 'rbd'
        },
        {
          name: 'test04',
          size: 25 * 1024 * 1024 * 1024,
          replicas: 1,
          type: 'block',
          backend: 'iscsi'
        },
        {
          name: 'test05',
          size: 105 * 1024 * 1024 * 1024,
          replicas: 1,
          type: 'object',
          backend: 'rgw'
        }
      ],
      status: {}
    };
    expect(component.buildSeriesData(services)).toEqual([
      {
        children: [
          {
            children: [
              {
                name: 'test03',
                value: 96636764160
              }
            ],
            name: 'RBD',
            value: 96636764160
          },
          {
            children: [
              {
                name: 'test04',
                value: 26843545600
              }
            ],
            name: 'iSCSI',
            value: 26843545600
          }
        ],
        name: 'Block',
        value: 123480309760
      },
      {
        children: [
          {
            children: [
              {
                name: 'test02',
                value: 161061273600
              }
            ],
            name: 'CephFS',
            value: 161061273600
          },
          {
            children: [
              {
                name: 'test01',
                value: 161061273600
              }
            ],
            name: 'NFS',
            value: 161061273600
          }
        ],
        name: 'File',
        value: 322122547200
      },
      {
        children: [
          {
            children: [
              {
                name: 'test05',
                value: 112742891520
              }
            ],
            name: 'RGW',
            value: 112742891520
          }
        ],
        name: 'Object',
        value: 112742891520
      }
    ]);
  });
});
