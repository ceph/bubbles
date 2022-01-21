import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { CoreModule } from '~/app/core/core.module';
import { DashboardPageComponent } from '~/app/pages/dashboard-page/dashboard-page.component';
import { EmptyPageComponent } from '~/app/pages/empty-page/empty-page.component';
import { HostsPageComponent } from '~/app/pages/hosts-page/hosts-page.component';
import { LoginPageComponent } from '~/app/pages/login-page/login-page.component';
import { NotFoundPageComponent } from '~/app/pages/not-found-page/not-found-page.component';
import { RgwUserPageComponent } from '~/app/pages/services-page/rgw/rgw-user-page/rgw-user-page.component';
import { RgwUsersPageComponent } from '~/app/pages/services-page/rgw/rgw-users-page/rgw-users-page.component';
import { ServicesPageComponent } from '~/app/pages/services-page/services-page.component';
import { UsersPageComponent } from '~/app/pages/users-page/users-page.component';
import { SharedModule } from '~/app/shared/shared.module';

@NgModule({
  declarations: [
    DashboardPageComponent,
    NotFoundPageComponent,
    HostsPageComponent,
    LoginPageComponent,
    UsersPageComponent,
    EmptyPageComponent,
    ServicesPageComponent,
    RgwUserPageComponent,
    RgwUsersPageComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    FlexLayoutModule,
    NgbModule,
    RouterModule,
    SharedModule,
    TranslateModule.forChild()
  ]
})
export class PagesModule {}
