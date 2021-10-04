import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { ComponentsModule } from '~/app/shared/components/components.module';
import { DirectivesModule } from '~/app/shared/directives/directives.module';
import { PipesModule } from '~/app/shared/pipes/pipes.module';
import { ClusterStatusService } from '~/app/shared/services/cluster-status.service';

@NgModule({
  exports: [ComponentsModule, DirectivesModule, PipesModule],
  imports: [CommonModule, ComponentsModule, DirectivesModule, PipesModule]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        // These services must be singletons across the whole app.
        ClusterStatusService
      ]
    };
  }
}
