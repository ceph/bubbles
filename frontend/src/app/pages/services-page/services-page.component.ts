import { Component } from '@angular/core';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import * as _ from 'lodash';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DeclarativeFormModalComponent } from '~/app/core/modals/declarative-form/declarative-form-modal.component';
import { translate } from '~/app/i18n.helper';
import { DatatableActionItem } from '~/app/shared/models/datatable-action-item.type';
import { DatatableColumn } from '~/app/shared/models/datatable-column.type';
import { DatatableData } from '~/app/shared/models/datatable-data.type';
import { BytesToSizePipe } from '~/app/shared/pipes/bytes-to-size.pipe';
import { RedundancyLevelPipe } from '~/app/shared/pipes/redundancy-level.pipe';
import { CephFSAuthorization, CephfsService } from '~/app/shared/services/api/cephfs.service';
import { Inventory, LocalNodeService } from '~/app/shared/services/api/local.service';
import {
  ServiceInfo,
  Services,
  ServicesService,
  ServiceType
} from '~/app/shared/services/api/services.service';
import { DialogService } from '~/app/shared/services/dialog.service';

@Component({
  selector: 'cb-services-page',
  templateUrl: './services-page.component.html',
  styleUrls: ['./services-page.component.scss']
})
export class ServicesPageComponent {
  @BlockUI()
  blockUI!: NgBlockUI;

  loading = false;
  firstLoadComplete = false;
  data: ServiceInfo[] = [];
  columns: DatatableColumn[];

  constructor(
    private servicesService: ServicesService,
    private bytesToSizePipe: BytesToSizePipe,
    private redundancyLevelPipe: RedundancyLevelPipe,
    private cephfsService: CephfsService,
    private dialogService: DialogService,
    private localNodeService: LocalNodeService
  ) {
    this.columns = [
      {
        name: TEXT('Name'),
        prop: 'name'
      },
      {
        name: TEXT('Type'),
        prop: 'type',
        cellTemplateName: 'map',
        cellTemplateConfig: {
          file: TEXT('File'),
          object: TEXT('Object'),
          block: TEXT('Block')
        }
      },
      {
        name: TEXT('Backend'),
        prop: 'backend',
        cellTemplateName: 'map',
        cellTemplateConfig: {
          cephfs: 'CephFS',
          nfs: 'NFS',
          rbd: 'RBD',
          iscsi: 'iSCSI',
          rgw: 'RGW'
        }
      },
      {
        name: TEXT('Size'),
        prop: 'size',
        pipe: this.bytesToSizePipe
      },
      {
        name: TEXT('Flavor'),
        prop: 'replicas',
        pipe: this.redundancyLevelPipe
      },
      {
        name: '',
        prop: '',
        cellTemplateName: 'actionMenu',
        cellTemplateConfig: this.onActionMenu.bind(this)
      }
    ];
  }

  onAdd(type: ServiceType): void {
    switch (type) {
      case 'block':
        break;
      case 'file':
        this.dialogService.open(
          DeclarativeFormModalComponent,
          (result) => {
            if (_.isPlainObject(result)) {
              this.createService(result as ServiceInfo);
            }
          },
          {
            title: TEXT('File Service'),
            submitButtonText: TEXT('Create'),
            formConfig: {
              fields: [
                {
                  type: 'hidden',
                  name: 'type',
                  value: 'file'
                },
                {
                  type: 'select',
                  name: 'backend',
                  label: TEXT('Type'),
                  value: 'nfs',
                  options: {
                    nfs: 'NFS',
                    cephfs: 'CephFS'
                  },
                  validators: {
                    required: true
                  }
                },
                {
                  type: 'text',
                  name: 'name',
                  label: TEXT('Name'),
                  value: '',
                  validators: {
                    required: true
                  }
                },
                {
                  type: 'binary',
                  name: 'size',
                  label: TEXT('Size'),
                  value: '1 GiB',
                  validators: {
                    required: true
                  }
                },
                {
                  type: 'select',
                  name: 'replicas',
                  label: TEXT('Number Of Replicas'),
                  value: 1,
                  options: {
                    1: this.redundancyLevelPipe.transform(1, 'flavor'),
                    2: this.redundancyLevelPipe.transform(2, 'flavor'),
                    3: this.redundancyLevelPipe.transform(3, 'flavor')
                  },
                  validators: {
                    required: true
                  }
                }
              ]
            }
          }
        );
        break;
      case 'object':
        break;
    }
  }

  loadData(): void {
    this.loading = true;
    this.servicesService.list().subscribe((data: Services) => {
      this.data = data.services;
      this.loading = this.firstLoadComplete = true;
    });
  }

  onActionMenu(serviceInfo: ServiceInfo): DatatableActionItem[] {
    const result: DatatableActionItem[] = [];
    switch (serviceInfo.backend) {
      case 'cephfs':
        result.push(
          {
            title: TEXT('Edit'),
            callback: (data: DatatableData) => {}
          },
          {
            title: TEXT('Show credentials'),
            callback: (data: DatatableData) => {
              this.cephfsService.authorization(data.name).subscribe((auth: CephFSAuthorization) => {
                // this.dialogService.open(DeclarativeFormModalComponent, undefined, {
                //   width: '40%',
                //   data: {
                //     title: 'Credentials',
                //     fields: [
                //       {
                //         type: 'text',
                //         name: 'entity',
                //         label: TEXT('Entity'),
                //         value: auth.entity,
                //         readonly: true
                //       },
                //       {
                //         type: 'password',
                //         name: 'key',
                //         label: TEXT('Key'),
                //         value: auth.key,
                //         readonly: true,
                //         hasCopyToClipboardButton: true
                //       }
                //     ],
                //     submitButtonVisible: false,
                //     cancelButtonText: TEXT('Close')
                //   }
                // });
              });
            }
          },
          {
            title: TEXT('Show mount command'),
            callback: (data: DatatableData) => {
              forkJoin({
                auth: this.cephfsService.authorization(data.name),
                inventory: this.localNodeService.inventory()
              }).subscribe((res) => {
                const ipAddr = this.getIpAddrFromInventory(res.inventory);
                const secret = res.auth.key;
                const name = res.auth.entity.replace('client.', '');
                const cmdArgs: Array<string> = [
                  'mount',
                  '-t',
                  'ceph',
                  '-o',
                  `secret=${secret},name=${name}`,
                  `${ipAddr}:/`,
                  '<MOUNTPOINT>'
                ];
                this.showMountCmdDialog(cmdArgs);
              });
            }
          },
          {
            type: 'divider'
          },
          {
            title: TEXT('Delete'),
            callback: (data: DatatableData) => {}
          }
        );
        break;
      case 'nfs':
        result.push(
          {
            title: TEXT('Edit'),
            callback: (data: DatatableData) => {}
          },
          {
            title: TEXT('Show mount command'),
            callback: (data: DatatableData) => {
              forkJoin({
                auth: this.cephfsService.authorization(data.name),
                inventory: this.localNodeService.inventory()
              }).subscribe((res) => {
                const ipAddr = this.getIpAddrFromInventory(res.inventory);
                const cmdArgs: Array<string> = [
                  'mount',
                  '-t',
                  'nfs',
                  `${ipAddr}:/${data.name}`,
                  '<MOUNTPOINT>'
                ];
                this.showMountCmdDialog(cmdArgs);
              });
            }
          },
          {
            type: 'divider'
          },
          {
            title: TEXT('Delete'),
            callback: (data: DatatableData) => {}
          }
        );
    }
    return result;
  }

  private createService(serviceInfo: ServiceInfo): void {
    this.blockUI.start(translate(TEXT('Please wait, deploying service ...')));
    this.servicesService
      .create(serviceInfo)
      .pipe(finalize(() => this.blockUI.stop()))
      .subscribe(() => this.loadData());
  }

  /**
   * Helper method to get the IP address from the inventory. If not
   * found, `<IPADDR>` will be returned instead.
   *
   * @param inventory The node's inventory.
   * @private
   */
  private getIpAddrFromInventory(inventory: Inventory): string {
    const physicalIfs = _.values(_.filter(inventory.nics, ['iftype', 'physical']));
    let ipAddr = _.get(_.first(physicalIfs), 'ipv4_address', '<IPADDR>') as string;
    if (ipAddr.indexOf('/')) {
      ipAddr = ipAddr.slice(0, ipAddr.indexOf('/'));
    }
    return ipAddr;
  }

  private showMountCmdDialog(cmdArgs: Array<string>): void {
    this.dialogService.open(DeclarativeFormModalComponent, undefined, {
      title: TEXT('Mount command'),
      subtitle: TEXT('Use the following command line to mount the file system.'),
      submitButtonVisible: false,
      cancelButtonText: TEXT('Close'),
      formConfig: {
        fields: [
          {
            type: 'text',
            name: 'cmdline',
            value: cmdArgs.join(' '),
            readonly: true,
            hasCopyToClipboardButton: true,
            class: 'cb-text-monospace'
          }
        ]
      }
    });
  }
}
