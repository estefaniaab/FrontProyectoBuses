import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangosEtariosComponent } from './rangos-etarios.component';

describe('RangosEtariosComponent', () => {
  let component: RangosEtariosComponent;
  let fixture: ComponentFixture<RangosEtariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RangosEtariosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RangosEtariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
