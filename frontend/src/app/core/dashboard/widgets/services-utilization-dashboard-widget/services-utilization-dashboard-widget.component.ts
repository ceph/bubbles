import { Component } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { EChartsOption } from 'echarts';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

import { bytesToSize } from '~/app/functions.helper';
import { ServiceInfo, Services, ServicesService } from '~/app/shared/services/api/services.service';

type Data = {
  name: string;
  value: number;
  children?: Array<Data>;
};

@Component({
  selector: 'cb-services-dashboard-widget',
  templateUrl: './services-utilization-dashboard-widget.component.html',
  styleUrls: ['./services-utilization-dashboard-widget.component.scss']
})
export class ServicesUtilizationDashboardWidgetComponent {
  initOpts = {
    height: 'auto',
    width: 'auto'
  };
  options: EChartsOption = {
    tooltip: {
      formatter: (params) =>
        [`${_.get(params, 'name')}<br>`, `${bytesToSize(_.get(params, 'value'))}`].join('')
    },
    series: [
      {
        type: 'treemap',
        leafDepth: 1,
        itemStyle: {
          gapWidth: 1
        },
        label: {
          show: true
        },
        upperLabel: {
          show: false
        },
        breadcrumb: {
          show: true
        },
        data: []
      }
    ]
  };
  hasData = false;

  constructor(private servicesService: ServicesService) {}

  updateData(services: Services) {
    this.hasData = services.services.length > 0;
    if (this.hasData) {
      _.set(this.options, 'series[0].data', this.buildSeriesData(services));
    }
  }

  loadData(): Observable<Services> {
    return this.servicesService.list();
  }

  buildSeriesData(services: Services): Array<Data> {
    const data: Record<string, Record<string, Array<Data>>> = {
      block: {
        rbd: [],
        iscsi: []
      },
      file: {
        cephfs: [],
        nfs: []
      },
      object: {
        rgw: []
      }
    };
    _.forEach(services.services, (serviceInfo: ServiceInfo) => {
      data[serviceInfo.type][serviceInfo.backend].push({
        name: serviceInfo.name,
        value: serviceInfo.size * serviceInfo.replicas
      });
    });
    return [
      {
        name: TEXT('Block'),
        value: _.sumBy(data.block.rbd, 'value') + _.sumBy(data.block.iscsi, 'value'),
        children: [
          {
            name: TEXT('RBD'),
            value: _.sumBy(data.block.rbd, 'value'),
            children: data.block.rbd
          },
          {
            name: TEXT('iSCSI'),
            value: _.sumBy(data.block.iscsi, 'value'),
            children: data.block.iscsi
          }
        ]
      },
      {
        name: TEXT('File'),
        value: _.sumBy(data.file.cephfs, 'value') + _.sumBy(data.file.nfs, 'value'),
        children: [
          {
            name: TEXT('CephFS'),
            value: _.sumBy(data.file.cephfs, 'value'),
            children: data.file.cephfs
          },
          {
            name: TEXT('NFS'),
            value: _.sumBy(data.file.nfs, 'value'),
            children: data.file.nfs
          }
        ]
      },
      {
        name: TEXT('Object'),
        value: _.sumBy(data.object.rgw, 'value'),
        children: [
          {
            name: TEXT('RGW'),
            value: _.sumBy(data.object.rgw, 'value'),
            children: data.object.rgw
          }
        ]
      }
    ];
  }
}
