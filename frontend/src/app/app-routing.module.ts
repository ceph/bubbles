/* eslint-disable max-len */
import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterModule, Routes } from '@angular/router';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';
import * as _ from 'lodash';
import { EMPTY } from 'rxjs';
import { first } from 'rxjs/operators';

import { BlankLayoutComponent } from '~/app/core/layouts/blank-layout/blank-layout.component';
import { MainLayoutComponent } from '~/app/core/layouts/main-layout/main-layout.component';
import { DashboardPageComponent } from '~/app/pages/dashboard-page/dashboard-page.component';
import { EmptyPageComponent } from '~/app/pages/empty-page/empty-page.component';
import { HostsPageComponent } from '~/app/pages/hosts-page/hosts-page.component';
import { LoginPageComponent } from '~/app/pages/login-page/login-page.component';
import { NotFoundPageComponent } from '~/app/pages/not-found-page/not-found-page.component';
import { ServicesPageComponent } from '~/app/pages/services-page/services-page.component';
import { UsersPageComponent } from '~/app/pages/users-page/users-page.component';
import { DialogComponent } from '~/app/shared/components/dialog/dialog.component';
import { ClusterStatus } from '~/app/shared/services/api/cluster.service';
import { AuthGuardService } from '~/app/shared/services/auth-guard.service';
import { ClusterStatusService } from '~/app/shared/services/cluster-status.service';
import { DialogService } from '~/app/shared/services/dialog.service';
import { NotificationService } from '~/app/shared/services/notification.service';

@Injectable()
export class CephDashboardRedirectResolver implements Resolve<any> {
  constructor(
    private clusterStatusService: ClusterStatusService,
    private dialogService: DialogService,
    private notificationService: NotificationService
  ) {}

  resolve(route: ActivatedRouteSnapshot): any {
    const url = decodeURIComponent(route.paramMap.get('url')!);
    if (_.isString(url)) {
      this.clusterStatusService.status$.pipe(first()).subscribe((clusterStatus: ClusterStatus) => {
        const dashboardUrl: string | null = _.get(clusterStatus, 'mgrmap.services.dashboard', null);
        if (!_.isString(dashboardUrl)) {
          this.notificationService.show(TEXT('Ceph Dashboard is not accessible.'), {
            type: 'error'
          });
        } else {
          this.dialogService.open(
            DialogComponent,
            (res: boolean) => {
              if (res) {
                window.open(`${_.trimEnd(dashboardUrl, '/')}/#${url}`, '_blank');
              }
            },
            {
              type: 'okCancel',
              icon: 'info',
              message: TEXT('This will redirect you to the Ceph Dashboard.')
            }
          );
        }
      });
    }
    return EMPTY;
  }
}

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        data: { breadcrumb: TEXT('Dashboard') },
        canActivate: [AuthGuardService],
        canActivateChild: [AuthGuardService],
        component: DashboardPageComponent
      },
      {
        path: 'hosts',
        data: { breadcrumb: TEXT('Hosts') },
        canActivate: [AuthGuardService],
        canActivateChild: [AuthGuardService],
        component: HostsPageComponent
      },
      {
        path: 'users',
        data: { breadcrumb: TEXT('Users') },
        canActivate: [AuthGuardService],
        canActivateChild: [AuthGuardService],
        component: UsersPageComponent
      },
      {
        path: 'services',
        data: { breadcrumb: TEXT('Services') },
        canActivate: [AuthGuardService],
        canActivateChild: [AuthGuardService],
        component: ServicesPageComponent
      }
    ]
  },
  {
    path: '',
    component: BlankLayoutComponent,
    children: [
      { path: 'login', component: LoginPageComponent },
      {
        path: 'cephDashboardRedirect/:url',
        resolve: {
          url: CephDashboardRedirectResolver
        },
        component: EmptyPageComponent
      },
      {
        path: '404',
        component: NotFoundPageComponent
      }
    ]
  },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule],
  providers: [CephDashboardRedirectResolver]
})
export class AppRoutingModule {}
