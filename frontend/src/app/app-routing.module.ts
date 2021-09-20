/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { marker as TEXT } from '@biesbjerg/ngx-translate-extract-marker';

import { BlankLayoutComponent } from '~/app/core/layouts/blank-layout/blank-layout.component';
import { MainLayoutComponent } from '~/app/core/layouts/main-layout/main-layout.component';
import { DashboardPageComponent } from '~/app/pages/dashboard-page/dashboard-page.component';
import { HostsPageComponent } from '~/app/pages/hosts-page/hosts-page.component';
import { LoginPageComponent } from '~/app/pages/login-page/login-page.component';
import { NotFoundPageComponent } from '~/app/pages/not-found-page/not-found-page.component';
import { UsersPageComponent } from '~/app/pages/users-page/users-page.component';
import { AuthGuardService } from '~/app/shared/services/auth-guard.service';

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
        children: [
          { path: '', component: DashboardPageComponent },
          { path: 'hosts', component: HostsPageComponent, data: { breadcrumb: TEXT('Hosts') } },
          { path: 'users', component: UsersPageComponent, data: { breadcrumb: TEXT('Users') } }
        ]
      }
    ]
  },
  {
    path: '',
    component: BlankLayoutComponent,
    children: [
      { path: 'login', component: LoginPageComponent },
      {
        path: '404',
        component: NotFoundPageComponent
      },
      { path: '**', redirectTo: '/404' }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
