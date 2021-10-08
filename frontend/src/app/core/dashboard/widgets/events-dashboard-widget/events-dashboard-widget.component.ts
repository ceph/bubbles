import { Component } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable } from 'rxjs';

import {
  DatatableCellTemplateName,
  DatatableColumn
} from '~/app/shared/models/datatable-column.type';
import { RelativeDatePipe } from '~/app/shared/pipes/relative-date.pipe';
import { ClusterService, Event } from '~/app/shared/services/api/cluster.service';

@Component({
  selector: 'cb-events-dashboard-widget',
  templateUrl: './events-dashboard-widget.component.html',
  styleUrls: ['./events-dashboard-widget.component.scss']
})
export class EventsDashboardWidgetComponent {
  data: Event[] = [];
  columns: DatatableColumn[];

  constructor(private clusterService: ClusterService, private relativeDatePipe: RelativeDatePipe) {
    this.columns = [
      {
        name: TEXT('Date'),
        prop: 'ts',
        pipe: this.relativeDatePipe
      },
      {
        name: TEXT('Severity'),
        prop: 'severity',
        cellTemplateName: DatatableCellTemplateName.badge,
        cellTemplateConfig: {
          map: {
            info: { value: TEXT('Information'), class: 'cb-color-theme-info' },
            warn: { value: TEXT('Warning'), class: 'cb-color-theme-warn' },
            danger: { value: TEXT('Danger'), class: 'cb-color-theme-danger' }
          }
        }
      },
      {
        name: TEXT('Message'),
        prop: 'message'
      }
    ];
  }

  updateData($data: Event[]) {
    this.data = $data;
  }

  loadData(): Observable<Event[]> {
    return this.clusterService.events();
  }
}
