import { Component } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { EChartsOption } from 'echarts';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { bytesToSize } from '~/app/functions.helper';
import { WidgetHealthStatus } from '~/app/shared/components/widget/widget.component';
import { StorageService, StorageStats } from '~/app/shared/services/api/storage.service';

@Component({
  selector: 'cb-storage-utilization-dashboard-widget',
  templateUrl: './storage-utilization-dashboard-widget.component.html',
  styleUrls: ['./storage-utilization-dashboard-widget.component.scss']
})
export class StorageUtilizationDashboardWidgetComponent {
  initOpts = {
    height: 'auto',
    width: 'auto'
  };
  options: EChartsOption = {
    title: {
      left: 'center',
      top: '27%',
      subtext: 'B/s',
      itemGap: 0
    },
    tooltip: {
      trigger: 'item',
      position: 'inside',
      formatter: '{b} ({d}%)'
    },
    legend: {
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        center: ['50%', '40%'],
        radius: ['50%', '70%'],
        label: {
          show: false
        },
        data: []
      }
    ]
  };

  constructor(private storageService: StorageService) {}

  loadData(): Observable<StorageStats> {
    return this.storageService.stats();
  }

  updateData(stats: StorageStats) {
    const total = _.split(bytesToSize(stats.total), ' ');
    _.set(this.options, 'title.text', total[0]);
    _.set(this.options, 'title.subtext', total[1]);
    _.set(this.options, 'series[0].data', [
      {
        name: `${TEXT('Unallocated')}: ${bytesToSize(stats.unallocated)}`,
        value: stats.unallocated,
        itemStyle: {
          color: '#009ccc'
        }
      },
      {
        name: `${TEXT('Allocated')}: ${bytesToSize(stats.allocated)}`,
        value: stats.allocated,
        itemStyle: {
          color: '#f58b1f'
        }
      }
    ]);
    // Force change-detection to redraw the chart.
    this.options = _.cloneDeep(this.options);
  }

  setHealthStatusIndicator(stats: StorageStats): WidgetHealthStatus {
    const utilization = (100 / stats.total) * stats.allocated;
    let healthStatus = WidgetHealthStatus.success;
    if (utilization >= 70) {
      healthStatus = WidgetHealthStatus.warning;
    } else if (utilization >= 90) {
      healthStatus = WidgetHealthStatus.error;
    }
    return healthStatus;
  }
}
