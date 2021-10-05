import { Component } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { EChartsOption } from 'echarts';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { bytesToSize } from '~/app/functions.helper';
import { ClusterStatus } from '~/app/shared/services/api/cluster.service';
import { ClusterStatusService } from '~/app/shared/services/cluster-status.service';

@Component({
  selector: 'cb-performance-dashboard-widget',
  templateUrl: './performance-dashboard-widget.component.html',
  styleUrls: ['./performance-dashboard-widget.component.scss']
})
export class PerformanceDashboardWidgetComponent {
  pieChartInitOpts = {
    height: '160px'
  };
  iopsPieChartOpts: EChartsOption = {
    title: {
      left: 'center',
      top: 'center',
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
        center: ['50%', '50%'],
        radius: ['50%', '70%'],
        label: {
          show: false
        },
        data: []
      }
    ]
  };
  rwPieChartOpts: EChartsOption = {
    title: {
      left: 'center',
      top: 'center',
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
        center: ['50%', '50%'],
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
    const iopsTotal = status.pgmap.read_op_per_sec + status.pgmap.write_op_per_sec;
    _.set(this.iopsPieChartOpts, 'title.text', iopsTotal);
    _.set(this.iopsPieChartOpts, 'series[0].data', [
      {
        name: `${TEXT('Read')}: ${status.pgmap.read_op_per_sec}/s`,
        value: status.pgmap.read_op_per_sec,
        itemStyle: {
          color: '#f58b1f'
        }
      },
      {
        name: `${TEXT('Write')}: ${status.pgmap.write_op_per_sec}/s`,
        value: status.pgmap.write_op_per_sec,
        itemStyle: {
          color: '#009ccc'
        }
      }
    ]);
    // Force change-detection to redraw the chart.
    this.iopsPieChartOpts = _.cloneDeep(this.iopsPieChartOpts);
    const rwTotal = _.split(
      bytesToSize(status.pgmap.read_bytes_sec + status.pgmap.write_bytes_sec),
      ' '
    );
    _.set(this.rwPieChartOpts, 'title.text', rwTotal[0]);
    _.set(this.rwPieChartOpts, 'title.subtext', rwTotal[1]);
    _.set(this.rwPieChartOpts, 'series[0].data', [
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
    this.rwPieChartOpts = _.cloneDeep(this.rwPieChartOpts);
  }
}
