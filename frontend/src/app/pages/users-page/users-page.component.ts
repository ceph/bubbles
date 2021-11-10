import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';

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

  loading = false;
  firstLoadComplete = false;
  data: User[] = [];
  columns: DatatableColumn[];

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
        sortable: false,
        cellTemplateName: DatatableCellTemplateName.actionMenu,
        cellTemplateConfig: this.onActionMenu.bind(this)
      }
    ];
  }

  loadData(): void {
    this.loading = true;
    this.usersService
      .list()
      .pipe(
        finalize(() => {
          this.loading = this.firstLoadComplete = true;
        })
      )
      .subscribe((data: User[]) => {
        this.data = data;
      });
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
