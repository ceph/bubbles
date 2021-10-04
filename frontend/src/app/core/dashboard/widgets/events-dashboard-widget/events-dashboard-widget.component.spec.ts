/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { DashboardModule } from '~/app/core/dashboard/dashboard.module';
import { EventsDashboardWidgetComponent } from '~/app/core/dashboard/widgets/events-dashboard-widget/events-dashboard-widget.component';
import { ClusterService, Event } from '~/app/shared/services/api/cluster.service';
import { FixtureHelper } from '~/testing/unit-test-helper';

describe('EventsDashboardWidgetComponent', () => {
  let component: EventsDashboardWidgetComponent;
  let fixture: ComponentFixture<EventsDashboardWidgetComponent>;
  let fh: FixtureHelper;
  const mockedData: Event[] = [
    {
      ts: 1633362463,
      severity: 'info',
      message: 'fooo bar asdasdlkasjd aksdjlas dasjdlsakjd asdkasld asdas.'
    },
    {
      ts: 1633363417,
      severity: 'warn',
      message: 'Lorem ipsum dolor sit amet, sed diam voluptua.'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardModule, HttpClientTestingModule, TranslateModule.forRoot()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsDashboardWidgetComponent);
    fh = new FixtureHelper(fixture);
    component = fixture.componentInstance;
    jest.spyOn(TestBed.inject(ClusterService), 'events').mockReturnValue(of(mockedData));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the right order in table', () => {
    fh.expectTextToBe('thead > tr', 'Date Severity Message');
  });

  it('should sort events by severity', () => {
    component.columns[1].css = 'severity';
    fh.expectTextToBe('thead > tr > th.severity.sortable', 'Severity');
    fh.clickElement('thead > tr > th.severity.sortable');
    fh.expectTextToBe('.sort-header', 'Severity');
    fh.expectTextsToBe('td.severity', ['info', 'warn']);
  });
});
