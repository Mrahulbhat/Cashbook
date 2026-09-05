import fs from 'fs';
import path from 'path';
import { chromium, type FullConfig } from '@playwright/test';

export type UserLogin = {
  name: string;
  phone: string;
  password: string;
};

export const USERS: UserLogin[] = [
  {
    name: 'test_name',
    phone: '9876543210',
    password: 'test123',
  }
];

const AUTH_DIR = path.join(__dirname, '.auth');
const RETRY_COUNT = 3;

async function loginWithApi(user: UserLogin, retries = RETRY_COUNT) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: 'http://localhost:5173' });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await context.request.post('/api/auth/login', {
        data: {
          phone: user.phone,
          password: user.password,
        },
      });

      if (!response.ok()) {
        const body = await response.text();
        throw new Error(`Login failed for ${user.phone}: ${response.status()} ${body}`);
      }

      const cookies = await context.cookies();
      if (!cookies.some((cookie) => cookie.name === 'token')) {
        throw new Error(`No auth cookie set for ${user.phone}`);
      }

      await browser.close();
      return;
    } catch (error) {
      if (attempt === retries) {
        await browser.close();
        throw error;
      }

      console.warn(`API login failed for ${user.phone} (attempt ${attempt}/${retries}). Retrying...`);
    }
  }
}

export default async function loginManager(_config: FullConfig) {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  for (const user of USERS) {
    const context = await browser.newContext({ baseURL: 'http://localhost:5173' });
    const statePath = path.join(AUTH_DIR, `${user.phone}.json`);

    try {
      let attempt = 0;
      while (attempt < RETRY_COUNT) {
        attempt += 1;

        const response = await context.request.post('/api/auth/login', {
          data: {
            phone: user.phone,
            password: user.password,
          },
        });

        const body = await response.text();
        if (response.ok()) {
          await context.storageState({ path: statePath });
          console.log(`✅ API login succeeded for ${user.phone}; state saved to ${statePath}`);
          break;
        }

        if (attempt === RETRY_COUNT) {
          throw new Error(`Login failed for ${user.phone}: ${response.status()} ${body}`);
        }

        console.warn(`API login failed for ${user.phone} (attempt ${attempt}/${RETRY_COUNT}). Retrying...`);
      }
    } catch (error) {
      console.error(`❌ Failed to login ${user.phone} after ${RETRY_COUNT} attempts:`, error);
    } finally {
      await context.close();
    }
  }

  const defaultUser = USERS[0];
  const defaultPath = path.join(AUTH_DIR, 'default.json');

  try {
    const defaultContext = await browser.newContext({ baseURL: 'http://localhost:5173' });
    const defaultResponse = await defaultContext.request.post('/api/auth/login', {
      data: {
        phone: defaultUser.phone,
        password: defaultUser.password,
      },
    });

    if (defaultResponse.ok()) {
      await defaultContext.storageState({ path: defaultPath });
      console.log(`✅ Default auth state saved to ${defaultPath}`);
    } else {
      throw new Error(`Default login failed: ${defaultResponse.status()}`);
    }

    await defaultContext.close();
  } catch (error) {
    console.error('❌ Failed to create default auth state:', error);
  }

  await browser.close();
}
