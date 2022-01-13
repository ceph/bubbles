import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { finalize } from 'rxjs/operators';

import { PageStatus } from '~/app/shared/components/content-page/content-page.component';
import {
  DatatableCellTemplateName,
  DatatableColumn
} from '~/app/shared/models/datatable-column.type';
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

  pageStatus: PageStatus = PageStatus.none;
  data: Host[] = [];
  columns: DatatableColumn[] = [];

  private firstLoadComplete = false;

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
        cellTemplateName: DatatableCellTemplateName.badge
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
    if (!this.firstLoadComplete) {
      this.pageStatus = PageStatus.loading;
    }
    this.hostService
      .list()
      .pipe(
        finalize(() => {
          this.firstLoadComplete = true;
        })
      )
      .subscribe(
        (data) => {
          this.data = data;
          this.pageStatus = PageStatus.ready;
        },
        () => (this.pageStatus = PageStatus.loadingError)
      );
  }
}
