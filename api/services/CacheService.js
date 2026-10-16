const redis = require('redis');

// Local in-memory fallback cache storage
const memory_store = new Map();
const memory_ttls = new Map();

let redis_client = null;
let use_redis = false;

// Initialize cache connection
async function init_cache() {
  if (process.env.REDIS_URL) {
    try {
      redis_client = redis.createClient({ url: process.env.REDIS_URL });

      redis_client.on('error', (err) => {
        console.error('Redis Cache Error, falling back to In-Memory store:', err.message);
        use_redis = false;
      });

      await redis_client.connect();
      console.log('Redis Cache Service successfully connected to:', process.env.REDIS_URL);
      use_redis = true;
    } catch (e) {
      console.error('Failed to connect to Redis. Running in-memory cache fallback:', e.message);
      use_redis = false;
    }
  } else {
    console.log('No REDIS_URL found. Running with local In-Memory Cache Service.');
    use_redis = false;
  }
}

// Trigger initialization immediately
init_cache();

module.exports = {
  /**
   * Fetch item from cache
   * @param {string} key
   * @returns {Promise<any>} Cached value or null
   */
  get: async function (key) {
    if (use_redis && redis_client) {
      try {
        const value = await redis_client.get(key);
        return value ? JSON.parse(value) : null;
      } catch (err) {
        console.error('Redis get error, reading from in-memory fallback:', err.message);
      }
    }

    // In-Memory Fallback
    if (memory_store.has(key)) {
      const expiration = memory_ttls.get(key);
      if (expiration && Date.now() > expiration) {
        // Expired, clear it
        memory_store.delete(key);
        memory_ttls.delete(key);
        return null;
      }
      return memory_store.get(key);
    }
    return null;
  },

  /**
   * Store item in cache
   * @param {string} key
   * @param {any} value
   * @param {number} ttl_seconds TTL in seconds (optional)
   */
  set: async function (key, value, ttl_seconds) {
    const string_value = JSON.stringify(value);

    if (use_redis && redis_client) {
      try {
        if (ttl_seconds) {
          await redis_client.set(key, string_value, { EX: ttl_seconds });
        } else {
          await redis_client.set(key, string_value);
        }
        return;
      } catch (err) {
        console.error('Redis set error, writing to in-memory fallback:', err.message);
      }
    }

    // In-Memory Fallback
    memory_store.set(key, value);
    if (ttl_seconds) {
      memory_ttls.set(key, Date.now() + (ttl_seconds * 1000));
    } else {
      memory_ttls.delete(key);
    }
  },

  /**
   * Delete item from cache
   * @param {string} key
   */
  delete: async function (key) {
    if (use_redis && redis_client) {
      try {
        await redis_client.del(key);
        return;
      } catch (err) {
        console.error('Redis delete error, deleting from in-memory fallback:', err.message);
      }
    }

    // In-Memory Fallback
    memory_store.delete(key);
    memory_ttls.delete(key);
  },

  /**
   * Clear all cached items
   */
  clear: async function () {
    if (use_redis && redis_client) {
      try {
        await redis_client.flushAll();
        console.log('Redis Cache Service flushed completely.');
        return;
      } catch (err) {
        console.error('Redis flushAll error, clearing in-memory fallback:', err.message);
      }
    }

    // In-Memory Fallback
    memory_store.clear();
    memory_ttls.clear();
    console.log('Local In-Memory Cache Service cleared completely.');
  }
};
