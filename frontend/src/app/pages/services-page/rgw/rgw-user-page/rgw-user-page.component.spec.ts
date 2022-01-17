import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';

import { PagesModule } from '~/app/pages/pages.module';
import { RgwUserPageComponent } from '~/app/pages/services-page/rgw/rgw-user-page/rgw-user-page.component';
import { TestingModule } from '~/app/testing.module';

describe('RgwUserPageComponent', () => {
  let component: RgwUserPageComponent;
  let fixture: ComponentFixture<RgwUserPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesModule, TestingModule, ToastrModule.forRoot(), TranslateModule.forRoot()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RgwUserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
