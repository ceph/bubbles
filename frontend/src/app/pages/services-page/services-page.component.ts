import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { ValidationErrors, ValidatorFn } from '@angular/forms';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import * as _ from 'lodash';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { forkJoin, Observable, of, timer } from 'rxjs';
import { finalize, map, switchMapTo } from 'rxjs/operators';

import { DeclarativeFormModalComponent } from '~/app/core/modals/declarative-form/declarative-form-modal.component';
import { bytesToSize, toBytes } from '~/app/functions.helper';
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
  DeclarativeForm,
  DeclarativeFormValues
} from '~/app/shared/models/declarative-form-config.type';
import { BytesToSizePipe } from '~/app/shared/pipes/bytes-to-size.pipe';
import { RedundancyLevelPipe } from '~/app/shared/pipes/redundancy-level.pipe';
import { CephFSAuthorization, CephfsService } from '~/app/shared/services/api/cephfs.service';
import { Host, HostService } from '~/app/shared/services/api/host.service';
import {
  ServiceInfo,
  Services,
  ServicesService,
  ServiceType
} from '~/app/shared/services/api/services.service';
import { StorageService, StorageStats } from '~/app/shared/services/api/storage.service';
import { DialogService } from '~/app/shared/services/dialog.service';

@Component({
  selector: 'cb-services-page',
  templateUrl: './services-page.component.html',
  styleUrls: ['./services-page.component.scss']
})
export class ServicesPageComponent {
  @BlockUI()
  blockUI!: NgBlockUI;

  pageStatus: PageStatus = PageStatus.none;
  data: ServiceInfo[] = [];
  columns: DatatableColumn[];

  private firstLoadComplete = false;

  constructor(
    private servicesService: ServicesService,
    private bytesToSizePipe: BytesToSizePipe,
    private redundancyLevelPipe: RedundancyLevelPipe,
    private cephfsService: CephfsService,
    private dialogService: DialogService,
    private hostService: HostService,
    private storageService: StorageService
  ) {
    this.columns = [
      {
        name: TEXT('Name'),
        prop: 'name'
      },
      {
        name: TEXT('Type'),
        prop: 'type',
        cellTemplateName: DatatableCellTemplateName.map,
        cellTemplateConfig: {
          file: TEXT('File'),
          object: TEXT('Object'),
          block: TEXT('Block')
        }
      },
      {
        name: TEXT('Backend'),
        prop: 'backend',
        cellTemplateName: DatatableCellTemplateName.map,
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
        cellTemplateName: DatatableCellTemplateName.actionMenu,
        cellTemplateConfig: this.onActionMenu.bind(this)
      }
    ];
  }

  onAdd(type: ServiceType): void {
    switch (type) {
      case 'block':
        break;
      case 'file':
        this.storageService.stats().subscribe((stats: StorageStats) => {
          this.dialogService.open(
            DeclarativeFormModalComponent,
            (result: DeclarativeFormValues | boolean) => {
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
                    type: 'text',
                    name: 'name',
                    label: TEXT('Name'),
                    placeholder: TEXT('Enter the name of this service'),
                    validators: {
                      required: true,
                      asyncCustom: this.nameValidator()
                    }
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
                    type: 'container',
                    fields: [
                      {
                        type: 'binary',
                        name: 'available',
                        label: TEXT('Available Capacity'),
                        value: stats.available,
                        hint: TEXT('The overall available capacity.'),
                        readonly: true
                      },
                      {
                        type: 'binary',
                        name: 'allocated',
                        label: TEXT('Allocated Capacity'),
                        value: stats.allocated,
                        hint: TEXT('The currently allocated capacity.'),
                        readonly: true
                      },
                      {
                        type: 'binary',
                        name: 'free',
                        label: TEXT('Unallocated Capacity'),
                        value: stats.unallocated,
                        hint: TEXT('The currently unallocated capacity.'),
                        readonly: true
                      }
                    ]
                  },
                  {
                    type: 'container',
                    fields: [
                      {
                        type: 'binary',
                        name: 'size',
                        label: TEXT('Estimated Required Capacity'),
                        placeholder: TEXT('E.g. 10 GiB'),
                        hint: TEXT('Enter the capacity of this service.'),
                        validators: {
                          required: true
                        },
                        defaultUnit: 'g',
                        onValueChanges: (
                          value: any,
                          control: AbstractControl,
                          form: DeclarativeForm
                        ) => {
                          const rawSize = (value as number) * (form.values.replicas as number);
                          form.patchValues({ rawSize: bytesToSize(rawSize) });
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
                        },
                        onValueChanges: (
                          value: any,
                          control: AbstractControl,
                          form: DeclarativeForm
                        ) => {
                          const rawSize = form.values.size * (value as number);
                          form.patchValues({ rawSize: bytesToSize(rawSize) });
                        }
                      }
                    ]
                  },
                  {
                    type: 'text',
                    name: 'rawSize',
                    readonly: true,
                    label: TEXT('Raw Required Capacity'),
                    hint: TEXT('The estimated raw capacity of this service.'),
                    validators: {
                      custom: this.budgetValidator(stats)
                    }
                  }
                ]
              }
            },
            {
              size: 'lg'
            }
          );
        });
        break;
      case 'object':
        break;
    }
  }

  loadData(): void {
    if (!this.firstLoadComplete) {
      this.pageStatus = PageStatus.loading;
    }
    this.servicesService
      .list()
      .pipe(
        finalize(() => {
          this.firstLoadComplete = true;
        })
      )
      .subscribe(
        (data: Services) => {
          this.data = data.services;
          this.pageStatus = PageStatus.ready;
        },
        () => (this.pageStatus = PageStatus.loadingError)
      );
  }

  onActionMenu(serviceInfo: ServiceInfo): DatatableActionItem[] {
    const result: DatatableActionItem[] = [];
    switch (serviceInfo.backend) {
      case 'cephfs':
        result.push(
          // {
          //   title: TEXT('Edit'),
          //   callback: (data: DatatableData) => {}
          // },
          {
            title: TEXT('Show credentials'),
            callback: (data: DatatableData) => {
              this.cephfsService.authorization(data.name).subscribe((res: CephFSAuthorization) => {
                this.dialogService.open(DeclarativeFormModalComponent, undefined, {
                  title: TEXT('Credentials'),
                  formConfig: {
                    fields: [
                      {
                        type: 'text',
                        name: 'entity',
                        label: TEXT('Entity'),
                        value: res.entity,
                        readonly: true,
                        hasCopyToClipboardButton: true
                      },
                      {
                        type: 'password',
                        name: 'key',
                        label: TEXT('Key'),
                        value: res.key,
                        readonly: true,
                        hasCopyToClipboardButton: true
                      }
                    ]
                  },
                  submitButtonVisible: false,
                  cancelButtonText: TEXT('Close')
                });
              });
            }
          },
          {
            title: TEXT('Show mount command'),
            callback: (data: DatatableData) => {
              forkJoin({
                auth: this.cephfsService.authorization(data.name),
                hosts: this.hostService.list()
              }).subscribe((res) => {
                const ipAddr: string = this.getIpAddrFromHosts(res.hosts);
                const secret: string = res.auth.key;
                const name: string = res.auth.entity.replace('client.', '');
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
            callback: (data: DatatableData) => this.deleteService(data.name)
          }
        );
        break;
      case 'nfs':
        result.push(
          // {
          //   title: TEXT('Edit'),
          //   callback: (data: DatatableData) => {}
          // },
          {
            title: TEXT('Show mount command'),
            callback: (data: DatatableData) => {
              this.hostService.list().subscribe((res) => {
                const ipAddr = this.getIpAddrFromHosts(res);
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
            callback: (data: DatatableData) => this.deleteService(data.name)
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

  private deleteService(name: string): void {
    this.dialogService.open(
      DialogComponent,
      (res: boolean) => {
        if (res) {
          this.blockUI.start(translate(TEXT('Please wait, deleting service ...')));
          this.servicesService
            .delete(name)
            .pipe(finalize(() => this.blockUI.stop()))
            .subscribe(() => this.loadData());
        }
      },
      {
        type: 'yesNo',
        icon: 'question',
        message: TEXT(`Do you really want to delete service <strong>${name}</strong>?`)
      }
    );
  }

  /**
   * Helper method to get the first found IP address in the list of hosts.
   * If not found, `<IPADDR>` will be returned instead.
   *
   * @param hosts The clusters's list of hosts.
   * @private
   */
  private getIpAddrFromHosts(hosts: Array<Host>): string {
    if (!hosts.length) {
      return '<IPADDR>';
    }
    return hosts[0].addr;
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

  private nameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (control.pristine || _.isEmpty(control.value)) {
        return of(null);
      }
      return timer(200).pipe(
        switchMapTo(this.servicesService.exists(control.value)),
        map((resp: boolean) => {
          if (!resp) {
            return null;
          } else {
            return { custom: TEXT('The service name is already in use.') };
          }
        })
      );
    };
  }

  private budgetValidator(stats: StorageStats): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (_.isEmpty(control.value)) {
        return null;
      }
      const value = toBytes(control.value);
      const overBudget = (value || 0) > stats.unallocated;
      const unallocated = bytesToSize(stats.unallocated);
      return overBudget
        ? { custom: TEXT(`Not enough capacity available, only ${unallocated} are free.`) }
        : null;
    };
  }
}
