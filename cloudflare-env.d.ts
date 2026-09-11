declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    INITIAL_OWNER_PIN?: string;
    INITIAL_WAITER_PIN?: string;
    INITIAL_CHEF_PIN?: string;
    INITIAL_CASHIER_PIN?: string;
  }
}
