import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { DashboardModule } from '~/app/core/dashboard/dashboard.module';
import { TestingModule } from '~/app/testing.module';

import { PerformanceBytesDashboardWidgetComponent } from './performance-bytes-dashboard-widget.component';

describe('PerformanceBytesDashboardWidgetComponent', () => {
  let component: PerformanceBytesDashboardWidgetComponent;
  let fixture: ComponentFixture<PerformanceBytesDashboardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule, TestingModule, TranslateModule.forRoot()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceBytesDashboardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
