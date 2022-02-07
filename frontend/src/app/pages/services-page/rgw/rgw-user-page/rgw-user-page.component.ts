import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import * as _ from 'lodash';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PageStatus } from '~/app/shared/components/content-page/content-page.component';
import { DeclarativeFormComponent } from '~/app/shared/components/declarative-form/declarative-form.component';
import {
  DeclarativeFormConfig,
  FormFieldConfig
} from '~/app/shared/models/declarative-form-config.type';
import { CephRgwUsersService, RgwUser } from '~/app/shared/services/api/ceph-rgw-users.service';

@Component({
  selector: 'cb-rgw-user-page',
  templateUrl: './rgw-user-page.component.html',
  styleUrls: ['./rgw-user-page.component.scss']
})
export class RgwUserPageComponent {
  @ViewChild(DeclarativeFormComponent, { static: false })
  form!: DeclarativeFormComponent;

  @BlockUI()
  blockUI!: NgBlockUI;

  // @ts-ignore
  config: DeclarativeFormConfig;

  pageStatus: PageStatus = PageStatus.none;

  constructor(
    private cephRgwUserService: CephRgwUsersService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((p: { name?: string }) => {
      if (p.name) {
        this.pageStatus = PageStatus.loading;
        this.cephRgwUserService.get(p.name!).subscribe(
          (user) => {
            // @ts-ignore
            user.max_buckets_mode =
              user.max_buckets > 0 ? 'custom' : user.max_buckets === 0 ? 'unlimited' : 'disabled';
            this.setupForm('update', user);
            this.pageStatus = PageStatus.ready;
          },
          () => (this.pageStatus = PageStatus.loadingError)
        );
      } else {
        this.setupForm('create');
        this.pageStatus = PageStatus.ready;
      }
    });
  }

  setupForm(mode: 'create' | 'update', values?: Record<string, any>): void {
    const tmpConfig: DeclarativeFormConfig = {
      buttons: [
        {
          type: 'default',
          text: TEXT('Cancel'),
          click: () => this.router.navigate(['services/object/users'])
        },
        {
          type: 'submit',
          text: mode === 'create' ? TEXT('Add') : TEXT('Edit'),
          click: () =>
            this.onSubmit(
              mode,
              mode === 'create'
                ? TEXT('Please wait, creating user ...')
                : TEXT('Please wait, updating user ...')
            )
        }
      ],
      fields: [
        {
          name: 'user_id',
          type: 'text',
          label: TEXT('Username'),
          value: '',
          validators: {
            required: true
          }
        },
        {
          name: 'display_name',
          type: 'text',
          label: TEXT('Full Name'),
          value: ''
        },
        {
          name: 'email',
          type: 'text',
          label: TEXT('Email'),
          value: '',
          validators: {
            patternType: 'email'
          }
        },
        {
          name: 'suspended',
          type: 'checkbox',
          label: TEXT('Suspended'),
          value: ''
        },
        {
          type: 'select',
          name: 'max_buckets_mode',
          label: TEXT('Max. Buckets'),
          value: 'custom',
          options: {
            disabled: TEXT('Disabled'),
            unlimited: TEXT('Unlimited'),
            custom: TEXT('Custom Value')
          }
        },
        {
          name: 'max_buckets',
          type: 'number',
          value: 1000,
          modifiers: [
            {
              type: 'hidden',
              constraint: {
                operator: 'ne',
                arg0: { prop: 'max_buckets_mode' },
                arg1: 'custom'
              }
            }
          ],
          validators: {
            requiredIf: {
              operator: 'eq',
              arg0: { prop: 'max_buckets_mode' },
              arg1: 'custom'
            },
            patternType: 'numeric'
          }
        }
      ]
    };
    // Populate field values if given.
    if (values) {
      _.forEach(tmpConfig.fields, (field: FormFieldConfig) => {
        if (field.name! in values) {
          field.value = values[field.name!];
        }
      });
    }
    this.config = tmpConfig;
  }

  onSubmit(mode: 'create' | 'update', message: string): void {
    const values = this.form.values;
    const user: RgwUser = _.omit(values, 'max_buckets_mode') as RgwUser;
    user.max_buckets =
      values.max_buckets_mode === 'disabled'
        ? -1
        : values.max_buckets_mode === 'unlimited'
        ? 0
        : user.max_buckets;
    this.blockUI.start(message);
    (this.cephRgwUserService[mode](user) as Observable<any>)
      .pipe(finalize(() => this.blockUI.stop()))
      .subscribe(() => this.router.navigate(['services/object/users']));
  }
}
