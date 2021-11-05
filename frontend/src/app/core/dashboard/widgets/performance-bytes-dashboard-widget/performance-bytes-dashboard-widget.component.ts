import { Component } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { EChartsOption } from 'echarts';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { bytesToSize } from '~/app/functions.helper';
import { ClusterStatus } from '~/app/shared/services/api/cluster.service';
import { ClusterStatusService } from '~/app/shared/services/cluster-status.service';

@Component({
  selector: 'cb-performance-bytes-dashboard-widget',
  templateUrl: './performance-bytes-dashboard-widget.component.html',
  styleUrls: ['./performance-bytes-dashboard-widget.component.scss']
})
export class PerformanceBytesDashboardWidgetComponent {
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
  updateOptions: EChartsOption = {};

  constructor(public clusterStatusService: ClusterStatusService) {}

  loadData(): Observable<ClusterStatus> {
    return this.clusterStatusService.status$;
  }

  updateData(status: ClusterStatus) {
    const rwTotal: string[] = _.split(
      bytesToSize(status.pgmap.read_bytes_sec + status.pgmap.write_bytes_sec),
      ' '
    );
    this.updateOptions = {
      title: {
        text: rwTotal[0],
        subtext: rwTotal[1]
      },
      series: [
        {
          data: [
            {
              name: `${TEXT('Read')}: ${bytesToSize(status.pgmap.read_bytes_sec)}/s`,
              value: status.pgmap.read_bytes_sec,
              itemStyle: {
                color: '#009ccc'
              }
            },
            {
              name: `${TEXT('Write')}: ${bytesToSize(status.pgmap.write_bytes_sec)}/s`,
              value: status.pgmap.write_bytes_sec,
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
