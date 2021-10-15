/* eslint-disable max-len */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { DashboardModule } from '~/app/core/dashboard/dashboard.module';
import { PerformanceOperationsDashboardWidgetComponent } from '~/app/core/dashboard/widgets/performance-operations-dashboard-widget/performance-operations-dashboard-widget.component';
import { TestingModule } from '~/app/testing.module';

describe('PerformanceOperationsDashboardWidgetComponent', () => {
  let component: PerformanceOperationsDashboardWidgetComponent;
  let fixture: ComponentFixture<PerformanceOperationsDashboardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule, TestingModule, TranslateModule.forRoot()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceOperationsDashboardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
