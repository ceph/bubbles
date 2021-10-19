import { Component } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { WidgetHealthStatus } from '~/app/shared/components/widget/widget.component';
import {
  Services,
  ServicesService,
  ServiceStatus,
  ServiceStatusCode
} from '~/app/shared/services/api/services.service';

type HealthStatus = {
  hasWarn: boolean;
  hasError: boolean;
  hasStatus: boolean;
  text: Array<string>;
};

@Component({
  selector: 'cb-services-health-dashboard-widget',
  templateUrl: './services-health-dashboard-widget.component.html',
  styleUrls: ['./services-health-dashboard-widget.component.scss']
})
export class ServicesHealthDashboardWidgetComponent {
  hasWarn = false;
  hasError = false;
  hasStatus = false;
  text: Array<string> = [];

  constructor(private servicesService: ServicesService) {}

  updateData(services: Services) {
    const stat = this.getHealthStatus(services);
    this.hasWarn = stat.hasWarn;
    this.hasError = stat.hasError;
    this.hasStatus = stat.hasStatus;
    this.text = stat.text;
  }

  loadData(): Observable<Services> {
    return this.servicesService.list();
  }

  getHealthStatus(services: Services): HealthStatus {
    const stat: HealthStatus = {
      hasWarn: false,
      hasError: false,
      hasStatus: _.keys(services.status).length > 0,
      text: []
    };
    if (stat.hasStatus) {
      const counts: Record<ServiceStatusCode, number> = {
        [ServiceStatusCode.OKAY]: 0,
        [ServiceStatusCode.WARN]: 0,
        [ServiceStatusCode.ERROR]: 0,
        [ServiceStatusCode.NONE]: 0
      };
      _.forEach(services.status, (serviceStatus: ServiceStatus, name: string) => {
        counts[serviceStatus.status]++;
      });
      if (counts[ServiceStatusCode.WARN] > 0) {
        stat.hasWarn = true;
        stat.text.push(`${counts[ServiceStatusCode.WARN]} ${TEXT('warn')}`);
      }
      if (counts[ServiceStatusCode.ERROR] > 0) {
        stat.hasError = true;
        stat.text.push(`${counts[ServiceStatusCode.ERROR]} ${TEXT('error')}`);
      }
    }
    return stat;
  }

  setHealthStatusIndicator(services: Services): WidgetHealthStatus {
    const stat = this.getHealthStatus(services);
    let healthStatus = WidgetHealthStatus.info;
    if (stat.hasStatus && !stat.hasWarn && !stat.hasError) {
      healthStatus = WidgetHealthStatus.success;
    } else if (stat.hasStatus && stat.hasWarn && !stat.hasError) {
      healthStatus = WidgetHealthStatus.warning;
    } else if (stat.hasStatus && stat.hasError) {
      healthStatus = WidgetHealthStatus.error;
    }
    return healthStatus;
  }
}
