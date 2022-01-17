import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import * as _ from 'lodash';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { finalize } from 'rxjs/operators';

import { DeclarativeFormModalComponent } from '~/app/core/modals/declarative-form/declarative-form-modal.component';
import { translate } from '~/app/i18n.helper';
import { PageStatus } from '~/app/shared/components/content-page/content-page.component';
import { DialogComponent } from '~/app/shared/components/dialog/dialog.component';
import { DatatableActionItem } from '~/app/shared/models/datatable-action-item.type';
import {
  DatatableCellTemplateName,
  DatatableColumn
} from '~/app/shared/models/datatable-column.type';
import { DatatableData } from '~/app/shared/models/datatable-data.type';
import {
  CephRgwUsersService,
  RgwUser,
  RgwUserKey
} from '~/app/shared/services/api/ceph-rgw-users.service';
import { DialogService } from '~/app/shared/services/dialog.service';

@Component({
  selector: 'cb-rgw-users-page',
  templateUrl: './rgw-users-page.component.html',
  styleUrls: ['./rgw-users-page.component.scss']
})
export class RgwUsersPageComponent {
  @BlockUI()
  blockUI!: NgBlockUI;

  columns: Array<DatatableColumn> = [];
  data: Array<RgwUser> = [];
  pageStatus: PageStatus = PageStatus.none;

  private firstLoadComplete = false;

  constructor(
    private cephRgwUserService: CephRgwUsersService,
    private dialogService: DialogService,
    private router: Router
  ) {
    this.columns = [
      {
        name: TEXT('Username'),
        prop: 'user_id'
      },
      {
        name: TEXT('Full Name'),
        prop: 'display_name'
      },
      {
        name: TEXT('Email'),
        prop: 'email'
      },
      {
        name: TEXT('Suspended'),
        prop: 'suspended',
        cellTemplateName: DatatableCellTemplateName.checkIcon
      },
      {
        name: TEXT('Max. Buckets'),
        prop: 'max_buckets',
        cellTemplateName: DatatableCellTemplateName.map,
        cellTemplateConfig: {
          '-1': TEXT('Disabled'),
          0: TEXT('Unlimited')
        }
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
    this.cephRgwUserService
      .list()
      .pipe(
        finalize(() => {
          this.firstLoadComplete = true;
        })
      )
      .subscribe(
        (data: RgwUser[]) => {
          this.data = data;
          this.pageStatus = PageStatus.ready;
        },
        () => (this.pageStatus = PageStatus.loadingError)
      );
  }

  private onActionMenu(user: RgwUser): DatatableActionItem[] {
    const key: RgwUserKey | undefined = _.find(user.keys, ['user', user.user_id]);
    const result: DatatableActionItem[] = [
      {
        title: TEXT('Edit'),
        callback: (data: DatatableData) => {
          this.router.navigate([`services/object/users/edit/${user.user_id}`]);
        }
      },
      {
        title: TEXT('Show Key'),
        disabled: _.isUndefined(key),
        callback: (data: DatatableData) => {
          this.dialogService.open(DeclarativeFormModalComponent, undefined, {
            title: TEXT('Keys'),
            submitButtonVisible: false,
            cancelButtonText: TEXT('Close'),
            formConfig: {
              fields: [
                {
                  type: 'text',
                  name: 'user_id',
                  value: key!.user,
                  readonly: true
                },
                {
                  type: 'text',
                  name: 'access_key',
                  value: key!.access_key,
                  readonly: true,
                  hasCopyToClipboardButton: true
                },
                {
                  type: 'password',
                  name: 'secret_key',
                  value: key!.secret_key,
                  readonly: true,
                  hasCopyToClipboardButton: true
                }
              ]
            }
          });
        }
      },
      {
        type: 'divider'
      },
      {
        title: TEXT('Delete'),
        callback: () => this.openDeletionDialog(user.user_id)
      }
    ];
    return result;
  }

  private openDeletionDialog(username: string) {
    this.dialogService.open(
      DialogComponent,
      (res: boolean) => {
        if (res) {
          this.blockUI.start(translate(TEXT('Please wait, deleting user ...')));
          this.cephRgwUserService
            .delete(username)
            .pipe(finalize(() => this.blockUI.stop()))
            .subscribe(() => {
              this.loadData();
            });
        }
      },
      {
        type: 'yesNo',
        icon: 'question',
        message: TEXT(`Do you really want to delete user <strong>${username}</strong>?`)
      }
    );
  }
}
