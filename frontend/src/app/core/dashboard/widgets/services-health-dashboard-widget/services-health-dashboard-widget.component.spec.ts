/* eslint-disable max-len */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { DashboardModule } from '~/app/core/dashboard/dashboard.module';
import { ServicesHealthDashboardWidgetComponent } from '~/app/core/dashboard/widgets/services-health-dashboard-widget/services-health-dashboard-widget.component';
import { ServiceStatusCode } from '~/app/shared/services/api/services.service';
import { TestingModule } from '~/app/testing.module';

describe('ServicesHealthDashboardWidgetComponent', () => {
  let component: ServicesHealthDashboardWidgetComponent;
  let fixture: ComponentFixture<ServicesHealthDashboardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule, TranslateModule.forRoot(), TestingModule, BrowserAnimationsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesHealthDashboardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update data [1]', () => {
    component.updateData({
      allocated: 0,
      services: [],
      status: {}
    });
    expect(component.text).toEqual([]);
    expect(component.hasWarn).toBeFalsy();
    expect(component.hasError).toBeFalsy();
    expect(component.hasStatus).toBeFalsy();
  });

  it('should update data [2]', () => {
    component.updateData({
      allocated: 0,
      services: [],
      status: {
        foo: {
          name: 'foo',
          status: ServiceStatusCode.OKAY,
          info: []
        },
        bar: {
          name: 'bar',
          status: ServiceStatusCode.WARN,
          info: []
        }
      }
    });
    expect(component.text).toEqual(['1 warn']);
    expect(component.hasWarn).toBeTruthy();
    expect(component.hasError).toBeFalsy();
    expect(component.hasStatus).toBeTruthy();
  });

  it('should update data [3]', () => {
    component.updateData({
      allocated: 0,
      services: [],
      status: {
        foo: {
          name: 'foo',
          status: ServiceStatusCode.ERROR,
          info: []
        },
        bar: {
          name: 'bar',
          status: ServiceStatusCode.NONE,
          info: []
        }
      }
    });
    expect(component.text).toEqual(['1 error']);
    expect(component.hasWarn).toBeFalsy();
    expect(component.hasError).toBeTruthy();
    expect(component.hasStatus).toBeTruthy();
  });

  it('should update data [3]', () => {
    component.updateData({
      allocated: 0,
      services: [],
      status: {
        foo: {
          name: 'foo',
          status: ServiceStatusCode.ERROR,
          info: []
        },
        bar: {
          name: 'bar',
          status: ServiceStatusCode.WARN,
          info: []
        },
        baz: {
          name: 'baz',
          status: ServiceStatusCode.WARN,
          info: []
        }
      }
    });
    expect(component.text).toEqual(['2 warn', '1 error']);
    expect(component.hasWarn).toBeTruthy();
    expect(component.hasError).toBeTruthy();
    expect(component.hasStatus).toBeTruthy();
  });
});
