import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBusesComponent } from './dashboard-buses.component';

describe('DashboardBusesComponent', () => {
  let component: DashboardBusesComponent;
  let fixture: ComponentFixture<DashboardBusesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardBusesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardBusesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
