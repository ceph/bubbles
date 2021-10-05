/* eslint-disable max-len */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';

import { EventsDashboardWidgetComponent } from '~/app/core/dashboard/widgets/events-dashboard-widget/events-dashboard-widget.component';
import { HealthDashboardWidgetComponent } from '~/app/core/dashboard/widgets/health-dashboard-widget/health-dashboard-widget.component';
import { PerformanceDashboardWidgetComponent } from '~/app/core/dashboard/widgets/performance-dashboard-widget/performance-dashboard-widget.component';
import { ServicesDashboardWidgetComponent } from '~/app/core/dashboard/widgets/services-dashboard-widget/services-dashboard-widget.component';
import { SharedModule } from '~/app/shared/shared.module';

@NgModule({
  declarations: [
    EventsDashboardWidgetComponent,
    HealthDashboardWidgetComponent,
    ServicesDashboardWidgetComponent,
    PerformanceDashboardWidgetComponent
  ],
  exports: [
    EventsDashboardWidgetComponent,
    HealthDashboardWidgetComponent,
    ServicesDashboardWidgetComponent,
    PerformanceDashboardWidgetComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NgxChartsModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    SharedModule,
    RouterModule,
    TranslateModule.forChild()
  ]
})
export class DashboardModule {}
