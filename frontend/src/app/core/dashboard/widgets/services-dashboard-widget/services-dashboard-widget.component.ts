import { Component } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { EChartsOption } from 'echarts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { translate, translateWords } from '~/app/i18n.helper';
import { BytesToSizePipe } from '~/app/shared/pipes/bytes-to-size.pipe';
import { Inventory, LocalNodeService } from '~/app/shared/services/api/local.service';

@Component({
  selector: 'cb-services-dashboard-widget',
  templateUrl: './services-dashboard-widget.component.html',
  styleUrls: ['./services-dashboard-widget.component.scss']
})
export class ServicesDashboardWidgetComponent {
  data: Inventory = {} as Inventory;
  ram: {
    inBytes: {
      total: number;
      used: number;
      free: number;
    };
    inPercent: {
      total: number;
      used: number;
      free: number;
    };
    asString: {
      total: string;
      used: string;
      free: string;
    };
  } = {
    inBytes: {
      total: 0,
      used: 0,
      free: 0
    },
    inPercent: {
      total: 100,
      used: 100,
      free: 0
    },
    asString: {
      total: '0 B',
      used: '0 B',
      free: '0 B'
    }
  };
  memoryGaugeInitOpts = {
    height: '200px'
  };
  memoryGaugeOpts: EChartsOption = {
    title: {
      padding: 0,
      show: true,
      text: '',
      subtext: ''
    },
    silent: true,
    series: [
      {
        center: ['50%', '60%'],
        itemStyle: {
          color: '#FFAB91'
        },
        progress: {
          show: true,
          width: 20
        },
        pointer: {
          show: false
        },
        axisLine: {
          lineStyle: {
            width: 20
          }
        },
        axisLabel: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        name: 'Memory',
        type: 'gauge',
        detail: {
          offsetCenter: [0, 0],
          fontSize: 16,
          formatter: '{value}%',
          color: 'auto'
        },
        data: []
      }
    ]
  };
  cpuLoadChartData: any[] = [];
  cpuLoadColorScheme = {
    // EOS colors: [$glass-color-yellow-100, $glass-color-yellow-500, $glass-color-yellow-900]
    domain: ['#ffecb5', '#ffc107', '#ff9e02']
  };

  constructor(private localNodeService: LocalNodeService) {}

  updateData($data: Inventory) {
    this.data = $data;
  }

  loadData(): Observable<Inventory> {
    return this.localNodeService.inventory().pipe(
      map((inventory: Inventory) => {
        this.updateMemory(inventory);
        /* eslint-disable @typescript-eslint/naming-convention */
        const load_1min = Math.floor(inventory.cpu.load.one_min * 100);
        const load_5min = Math.floor(inventory.cpu.load.five_min * 100);
        const load_15min = Math.floor(inventory.cpu.load.fifteen_min * 100);
        this.cpuLoadChartData = [
          { name: translate(TEXT('1 min')), value: `${load_1min}%` },
          { name: translate(TEXT('5 min')), value: `${load_5min}%` },
          { name: translate(TEXT('15 min')), value: `${load_15min}%` }
        ];
        // Modify the uptime value to allow the `relativeDate` pipe
        // to calculate the correct time to display.
        inventory.system_uptime = inventory.system_uptime * -1;
        return inventory;
      })
    );
  }

  updateMemory(inventory: Inventory) {
    this.updateRamSpec(inventory);
    const words = translateWords([TEXT('Used'), TEXT('Free'), TEXT('Total')]);
    // Somehow TS can't figure out the subtypes of EChartsOption that are already defined.
    // @ts-ignore
    this.memoryGaugeOpts.title.subtext = [
      `${words.Total!}: ${this.ram.asString.total}`,
      `${words.Used!}: ${this.ram.asString.used}`,
      `${words.Free!}: ${this.ram.asString.free}`
    ].join('\n');
    // Somehow TS can't figure out the subtypes of EChartsOption that are already defined.
    // @ts-ignore
    this.memoryGaugeOpts.series[0].data = [{ value: this.ram.inPercent.used }];
  }

  private updateRamSpec(inventory: Inventory) {
    const ramSpec = {
      total: inventory.memory.total_kb,
      free: inventory.memory.free_kb,
      used: inventory.memory.total_kb - inventory.memory.free_kb
    };
    // Note, this implementation is by intention, do NOT use code like
    // 'valueFormatting.bind(this)', otherwise this method is called
    // over and over again because Angular CD seems to assume something
    // has been changed.
    const pipe = new BytesToSizePipe();
    const indexArrTypeSafe: ('total' | 'free' | 'used')[] = ['total', 'free', 'used'];
    indexArrTypeSafe.forEach((s) => {
      this.ram.inBytes[s] = ramSpec[s] * 1024;
      this.ram.inPercent[s] = Math.round((this.ram.inBytes[s] / this.ram.inBytes.total) * 100);
      this.ram.asString[s] = pipe.transform(this.ram.inBytes[s]);
    });
  }
}