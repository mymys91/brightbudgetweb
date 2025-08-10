import { Injectable } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  environment: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;

  constructor() {
    this.initializeConfig();
  }

  private detectEnvironment(): string {
    // Detect environment based on hostname or other criteria
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
      } else if (hostname.includes('staging') || hostname.includes('dev')) {
        return 'staging';
      } else {
        return 'production';
      }
    }
    return 'development';
  }

  private initializeConfig(): void {
    const currentEnv = this.detectEnvironment();
    console.log('Detected environment:', currentEnv);

    // Hardcoded configs to avoid circular dependency
    const configs: { [key: string]: AppConfig } = {
      development: {
        apiUrl: 'http://localhost:5266/api',
        environment: 'development'
      },
      staging: {
        apiUrl: 'https://staging-api.yourdomain.com/api',
        environment: 'staging'
      },
      production: {
        apiUrl: 'https://api.yourdomain.com/api',
        environment: 'production'
      }
    };

    this.config = configs[currentEnv] || configs['development'];
    console.log('Loaded config for environment:', this.config);
  }

  getConfig(): AppConfig | null {
    return this.config;
  }

  getApiUrl(): string {
    return this.config?.apiUrl || 'http://localhost:5266/api';
  }
}
