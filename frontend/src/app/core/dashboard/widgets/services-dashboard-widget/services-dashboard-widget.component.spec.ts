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
import { ServicesDashboardWidgetComponent } from '~/app/core/dashboard/widgets/services-dashboard-widget/services-dashboard-widget.component';
import { Inventory } from '~/app/shared/services/api/local.service';
import { TestingModule } from '~/app/testing.module';

describe('ServicesDashboardWidgetComponent', () => {
  let component: ServicesDashboardWidgetComponent;
  let fixture: ComponentFixture<ServicesDashboardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule, TranslateModule.forRoot(), TestingModule, BrowserAnimationsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesDashboardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Memory', () => {
    let inventoryMock: Inventory;
    beforeEach(() => {
      inventoryMock = {
        memory: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          total_kb: 100,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          free_kb: 95
        }
      } as Inventory;
      component.updateMemory(inventoryMock);
    });

    it('should calculate memory usage in percent', () => {
      expect(component.ram).toEqual({
        inBytes: {
          total: 102400,
          used: 5120,
          free: 97280
        },
        inPercent: {
          total: 100,
          used: 5,
          free: 95
        },
        asString: {
          total: '100 KiB',
          used: '5 KiB',
          free: '95 KiB'
        }
      });
    });

    it('should show the right gauge text', () => {
      // @ts-ignore
      expect(component.memoryGaugeOpts.title.subtext).toBe(
        'Total: 100 KiB\nUsed: 5 KiB\nFree: 95 KiB'
      );
    });
  });
});
