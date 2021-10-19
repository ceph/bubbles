/* eslint-disable max-len */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxEchartsModule } from 'ngx-echarts';

import { EventsDashboardWidgetComponent } from '~/app/core/dashboard/widgets/events-dashboard-widget/events-dashboard-widget.component';
import { HealthDashboardWidgetComponent } from '~/app/core/dashboard/widgets/health-dashboard-widget/health-dashboard-widget.component';
import { PerformanceBytesDashboardWidgetComponent } from '~/app/core/dashboard/widgets/performance-bytes-dashboard-widget/performance-bytes-dashboard-widget.component';
import { PerformanceOperationsDashboardWidgetComponent } from '~/app/core/dashboard/widgets/performance-operations-dashboard-widget/performance-operations-dashboard-widget.component';
import { ServicesHealthDashboardWidgetComponent } from '~/app/core/dashboard/widgets/services-health-dashboard-widget/services-health-dashboard-widget.component';
import { ServicesUtilizationDashboardWidgetComponent } from '~/app/core/dashboard/widgets/services-utilization-dashboard-widget/services-utilization-dashboard-widget.component';
import { StorageUtilizationDashboardWidgetComponent } from '~/app/core/dashboard/widgets/storage-utilization-dashboard-widget/storage-utilization-dashboard-widget.component';
import { SharedModule } from '~/app/shared/shared.module';

@NgModule({
  declarations: [
    EventsDashboardWidgetComponent,
    HealthDashboardWidgetComponent,
    ServicesUtilizationDashboardWidgetComponent,
    PerformanceBytesDashboardWidgetComponent,
    PerformanceOperationsDashboardWidgetComponent,
    StorageUtilizationDashboardWidgetComponent,
    ServicesHealthDashboardWidgetComponent
  ],
  exports: [
    EventsDashboardWidgetComponent,
    HealthDashboardWidgetComponent,
    ServicesUtilizationDashboardWidgetComponent,
    PerformanceBytesDashboardWidgetComponent,
    PerformanceOperationsDashboardWidgetComponent,
    StorageUtilizationDashboardWidgetComponent,
    ServicesHealthDashboardWidgetComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    SharedModule,
    RouterModule,
    TranslateModule.forChild()
  ]
})
export class DashboardModule {}
