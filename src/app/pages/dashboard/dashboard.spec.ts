import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../features/auth';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: of({ name: 'Test User', email: 'test@example.com' })
    });

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name from auth service', () => {
    const welcomeTitle = fixture.nativeElement.querySelector('.welcome-title');
    expect(welcomeTitle.textContent).toContain('Test User');
  });

  it('should call auth service logout on sign out', () => {
    mockAuthService.logout.and.returnValue(of(void 0));
    component.signOut();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
