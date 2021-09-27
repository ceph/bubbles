import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { finalize } from 'rxjs/operators';

import { DatatableColumn } from '~/app/shared/models/datatable-column.type';
import { CephShortVersionPipe } from '~/app/shared/pipes/ceph-short-version.pipe';
import { Host, HostService } from '~/app/shared/services/api/host.service';

@Component({
  selector: 'cb-hosts-page',
  templateUrl: './hosts-page.component.html',
  styleUrls: ['./hosts-page.component.scss']
})
export class HostsPageComponent implements OnInit {
  @ViewChild('servicesTpl', { static: true })
  public servicesTpl?: TemplateRef<any>;

  loading = false;
  firstLoadComplete = false;
  data: Host[] = [];
  columns: DatatableColumn[] = [];

  constructor(
    private cephShortVersionPipe: CephShortVersionPipe,
    private hostService: HostService
  ) {}

  ngOnInit(): void {
    this.columns = [
      {
        name: TEXT('Hostname'),
        prop: 'hostname'
      },
      {
        name: TEXT('Services'),
        prop: 'services',
        cellTemplate: this.servicesTpl
      },
      {
        name: TEXT('Labels'),
        prop: 'labels',
        cellTemplateName: 'join'
      },
      {
        name: TEXT('Status'),
        prop: 'status'
      },
      {
        name: TEXT('Version'),
        prop: 'ceph_version',
        pipe: this.cephShortVersionPipe
      }
    ];
  }

  loadData(): void {
    this.loading = true;
    this.hostService
      .list()
      .pipe(
        finalize(() => {
          this.loading = this.firstLoadComplete = true;
        })
      )
      .subscribe((data) => {
        this.data = data;
      });
  }
}
