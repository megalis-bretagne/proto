import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliberationsComponent } from './deliberations.component';

describe('DeliberationsComponent', () => {
  let component: DeliberationsComponent;
  let fixture: ComponentFixture<DeliberationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliberationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliberationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
