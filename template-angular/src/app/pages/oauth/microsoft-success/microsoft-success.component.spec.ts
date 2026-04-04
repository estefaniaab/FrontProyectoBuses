import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftSuccessComponent } from './microsoft-success.component';

describe('MicrosoftSuccessComponent', () => {
  let component: MicrosoftSuccessComponent;
  let fixture: ComponentFixture<MicrosoftSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MicrosoftSuccessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicrosoftSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
