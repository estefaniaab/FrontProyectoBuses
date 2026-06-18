import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClimaConfigComponent } from './clima-config.component';

describe('ClimaConfigComponent', () => {
  let component: ClimaConfigComponent;
  let fixture: ComponentFixture<ClimaConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClimaConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClimaConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
