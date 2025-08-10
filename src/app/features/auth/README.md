# Authentication Service

This directory contains the authentication service and related components for the BrightBudget application.

## Components

### AuthService
The main authentication service that handles:
- User login/logout
- User registration
- Token management
- User profile updates
- Password management
- Authentication state

### AuthInterceptor
HTTP interceptor that automatically:
- Adds authentication tokens to outgoing requests
- Handles 401 errors by attempting token refresh
- Logs out users when authentication fails

### AuthGuard
Route guard that protects routes requiring authentication.

## Usage

### Basic Authentication
```typescript
import { AuthService } from '../../features/auth';

constructor(private authService: AuthService) {}

// Login
this.authService.login({ email: 'user@example.com', password: 'password' })
  .subscribe(user => console.log('Logged in:', user));

// Register
this.authService.register({ email: 'user@example.com', password: 'password', name: 'John Doe' })
  .subscribe(user => console.log('Registered:', user));

// Logout
this.authService.logout();

// Check authentication status
if (this.authService.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = this.authService.getCurrentUser();
```

### Observables
```typescript
// Subscribe to authentication state changes
this.authService.isAuthenticated$.subscribe(isAuth => {
  if (isAuth) {
    // User is authenticated
  } else {
    // User is not authenticated
  }
});

// Subscribe to current user changes
this.authService.currentUser$.subscribe(user => {
  if (user) {
    // User is logged in
  } else {
    // User is logged out
  }
});
```

### Route Protection
```typescript
// In your routing configuration
import { AuthGuard } from '../../features/auth';

const routes: Routes = [
  { path: 'wallet', component: WalletComponent, canActivate: [AuthGuard] }
];
```

## Configuration

### API URL
Update the `API_URL` constant in `auth.service.ts` to match your backend endpoint:

```typescript
private readonly API_URL = 'https://your-api-domain.com/api';
```

### Token Storage
The service uses localStorage for token storage. You can customize the storage keys by modifying:

```typescript
private readonly TOKEN_KEY = 'auth_token';
private readonly USER_KEY = 'current_user';
```

## Error Handling

The service includes comprehensive error handling for:
- Network errors
- Authentication failures
- Token expiration
- Server errors

All errors are wrapped in a consistent format and can be handled in your components.

## Security Features

- Automatic token refresh on 401 errors
- Secure token storage
- Automatic logout on authentication failure
- Route protection with guards
- HTTP interceptor for automatic token inclusion
