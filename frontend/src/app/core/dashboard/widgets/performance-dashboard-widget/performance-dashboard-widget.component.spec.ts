import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { DashboardModule } from '~/app/core/dashboard/dashboard.module';
import { TestingModule } from '~/app/testing.module';

import { PerformanceDashboardWidgetComponent } from './performance-dashboard-widget.component';

describe('PerformanceDashboardWidgetComponent', () => {
  let component: PerformanceDashboardWidgetComponent;
  let fixture: ComponentFixture<PerformanceDashboardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule, TestingModule, TranslateModule.forRoot()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceDashboardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
