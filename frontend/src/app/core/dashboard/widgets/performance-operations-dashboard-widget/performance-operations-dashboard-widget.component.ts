import { Component } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { EChartsOption } from 'echarts';
import { Observable } from 'rxjs';

import { ClusterStatus } from '~/app/shared/services/api/cluster.service';
import { ClusterStatusService } from '~/app/shared/services/cluster-status.service';

@Component({
  selector: 'cb-performance-operations-dashboard-widget',
  templateUrl: './performance-operations-dashboard-widget.component.html',
  styleUrls: ['./performance-operations-dashboard-widget.component.scss']
})
export class PerformanceOperationsDashboardWidgetComponent {
  initOpts = {
    height: 'auto',
    width: 'auto'
  };
  options: EChartsOption = {
    title: {
      left: 'center',
      top: '27%',
      subtext: 'IOPS',
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
  updateOptions: EChartsOption = {};

  constructor(public clusterStatusService: ClusterStatusService) {}

  loadData(): Observable<ClusterStatus> {
    return this.clusterStatusService.status$;
  }

  updateData(status: ClusterStatus) {
    const iopsTotal: number = status.pgmap.read_op_per_sec + status.pgmap.write_op_per_sec;
    this.updateOptions = {
      title: {
        text: `${iopsTotal}`
      },
      series: [
        {
          data: [
            {
              name: `${TEXT('Read')}: ${status.pgmap.read_op_per_sec}/s`,
              value: status.pgmap.read_op_per_sec,
              itemStyle: {
                color: '#009ccc'
              }
            },
            {
              name: `${TEXT('Write')}: ${status.pgmap.write_op_per_sec}/s`,
              value: status.pgmap.write_op_per_sec,
              itemStyle: {
                color: '#f58b1f'
              }
            }
          ]
        }
      ]
    };
  }
}
