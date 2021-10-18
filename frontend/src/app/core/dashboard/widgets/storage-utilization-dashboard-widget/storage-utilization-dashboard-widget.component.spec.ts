import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { DashboardModule } from '~/app/core/dashboard/dashboard.module';
import { TestingModule } from '~/app/testing.module';

import { StorageUtilizationDashboardWidgetComponent } from './storage-utilization-dashboard-widget.component';

describe('StorageStatsDashboardWidgetComponent', () => {
  let component: StorageUtilizationDashboardWidgetComponent;
  let fixture: ComponentFixture<StorageUtilizationDashboardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule, TestingModule, TranslateModule.forRoot()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageUtilizationDashboardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
