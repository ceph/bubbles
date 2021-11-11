import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';

import { PageStatus } from '~/app/shared/components/content-page/content-page.component';
import { DatatableActionItem } from '~/app/shared/models/datatable-action-item.type';
import {
  DatatableCellTemplateName,
  DatatableColumn
} from '~/app/shared/models/datatable-column.type';
import { DatatableData } from '~/app/shared/models/datatable-data.type';
import { User, UsersService } from '~/app/shared/services/api/users.service';

@Component({
  selector: 'cb-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.scss']
})
export class UsersPageComponent {
  @BlockUI()
  blockUI!: NgBlockUI;

  pageStatus: PageStatus = PageStatus.none;
  data: User[] = [];
  columns: DatatableColumn[];

  private firstLoadComplete = false;

  constructor(private usersService: UsersService, private router: Router) {
    this.columns = [
      {
        name: TEXT('Username'),
        prop: 'username'
      },
      {
        name: TEXT('Name'),
        prop: 'name'
      },
      {
        name: TEXT('Email'),
        prop: 'email'
      },
      {
        name: TEXT('Roles'),
        prop: 'roles',
        cellTemplateName: DatatableCellTemplateName.join
      },
      {
        name: TEXT('Enabled'),
        prop: 'enabled',
        cellTemplateName: DatatableCellTemplateName.checkIcon
      },
      {
        name: '',
        prop: '',
        cellTemplateName: DatatableCellTemplateName.actionMenu,
        cellTemplateConfig: this.onActionMenu.bind(this)
      }
    ];
  }

  loadData(): void {
    if (!this.firstLoadComplete) {
      this.pageStatus = PageStatus.loading;
    }
    this.usersService
      .list()
      .pipe(
        finalize(() => {
          this.firstLoadComplete = true;
        })
      )
      .subscribe(
        (data: User[]) => {
          this.data = data;
          this.pageStatus = PageStatus.ready;
        },
        () => (this.pageStatus = PageStatus.loadingError)
      );
  }

  onAdd(): void {
    this.navigateTo('/user-management/users/create');
  }

  onActionMenu(user: User): DatatableActionItem[] {
    const result: DatatableActionItem[] = [
      {
        title: TEXT('Edit'),
        callback: (data: DatatableData) => {
          this.navigateTo(`/user-management/users/edit/${user.username}`);
        }
      },
      {
        type: 'divider'
      },
      {
        title: TEXT('Delete'),
        callback: (data: DatatableData) => {
          this.navigateTo('/user-management/users');
        }
      }
    ];
    return result;
  }

  private navigateTo(url: string): void {
    this.router.navigateByUrl(`/cephDashboardRedirect/${encodeURIComponent(url)}`, {
      skipLocationChange: true
    });
  }
}
