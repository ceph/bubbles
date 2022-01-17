import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RgwUsersPageComponent } from '~/app/pages/services-page/rgw/rgw-users-page/rgw-users-page.component';
import { TestingModule } from '~/app/testing.module';

describe('RgwUsersPageComponent', () => {
  let component: RgwUsersPageComponent;
  let fixture: ComponentFixture<RgwUsersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestingModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RgwUsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
