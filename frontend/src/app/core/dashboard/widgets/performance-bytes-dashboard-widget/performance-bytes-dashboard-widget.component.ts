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

  constructor(public clusterStatusService: ClusterStatusService) {}

  loadData(): Observable<ClusterStatus> {
    return this.clusterStatusService.status$;
  }

  updateData(status: ClusterStatus) {
    const rwTotal = _.split(
      bytesToSize(status.pgmap.read_bytes_sec + status.pgmap.write_bytes_sec),
      ' '
    );
    _.set(this.options, 'title.text', rwTotal[0]);
    _.set(this.options, 'title.subtext', rwTotal[1]);
    _.set(this.options, 'series[0].data', [
      {
        name: `${TEXT('Read')}: ${bytesToSize(status.pgmap.read_bytes_sec)}/s`,
        value: status.pgmap.read_bytes_sec,
        itemStyle: {
          color: '#f58b1f'
        }
      },
      {
        name: `${TEXT('Write')}: ${bytesToSize(status.pgmap.write_bytes_sec)}/s`,
        value: status.pgmap.write_bytes_sec,
        itemStyle: {
          color: '#009ccc'
        }
      }
    ]);
    // Force change-detection to redraw the chart.
    this.options = _.cloneDeep(this.options);
  }
}
