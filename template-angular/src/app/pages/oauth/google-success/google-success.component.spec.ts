import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleSuccessComponent } from './google-success.component';

describe('GoogleSuccessComponent', () => {
  let component: GoogleSuccessComponent;
  let fixture: ComponentFixture<GoogleSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleSuccessComponent ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GoogleSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
