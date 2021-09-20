import { Component } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { translate } from '~/app/i18n.helper';
import { BytesToSizePipe } from '~/app/shared/pipes/bytes-to-size.pipe';
import { Inventory, LocalNodeService } from '~/app/shared/services/api/local.service';

@Component({
  selector: 'cb-sys-info-dashboard-widget',
  templateUrl: './sys-info-dashboard-widget.component.html',
  styleUrls: ['./sys-info-dashboard-widget.component.scss']
})
export class SysInfoDashboardWidgetComponent {
  data: Inventory = {} as Inventory;
  memoryChartData: any[] = [];
  memoryChartColorScheme = {
    // EOS colors: [$cb-color-green-500, $cb-color-gray-100]
    domain: ['#30ba78', '#e0dfdf']
  };
  cpuLoadChartData: any[] = [];
  cpuLoadColorScheme = {
    // EOS colors: [$cb-color-yellow-100, $cb-color-yellow-500, $cb-color-yellow-900]
    domain: ['#ffecb5', '#ffc107', '#ff9e02']
  };

  constructor(private localNodeService: LocalNodeService) {}

  valueFormatting(c: any) {
    // Note, this implementation is by intention, do NOT use code like
    // 'valueFormatting.bind(this)', otherwise this method is called
    // over and over again because Angular CD seems to assume something
    // has been changed.
    const pipe = new BytesToSizePipe();
    return pipe.transform(c);
  }

  updateData($data: Inventory) {
    this.data = $data;
  }

  loadData(): Observable<Inventory> {
    return this.localNodeService.inventory().pipe(
      map((inventory: Inventory) => {
        const total: number = inventory.memory.total_kb * 1024;
        const free: number = inventory.memory.free_kb * 1024;
        this.memoryChartData = [
          {
            name: translate(TEXT('Used')),
            value: total - free
          },
          {
            name: translate(TEXT('Free')),
            value: free
          }
        ];
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
}
