import type { Hono } from 'hono';

interface RequestMetric {
  timestamp: number;
  latency: number;
  endpoint: string;
  status: number;
}

interface CelebrityCount {
  name: string;
  count: number;
}

class SimpleMetrics {
  private requests: RequestMetric[] = [];
  private celebrityCounts: Map<string, number> = new Map();
  private errorLogs: { timestamp: number; endpoint: string; message: string; status?: number }[] = [];
  private maxRequests = 1000; // Keep last 1000 requests

  addRequest(latency: number, endpoint: string, status: number) {
    this.requests.push({
      timestamp: Date.now(),
      latency,
      endpoint,
      status
    });

    // Keep only last N requests
    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(-this.maxRequests);
    }
  }

  addCelebrity(name: string) {
    const current = this.celebrityCounts.get(name) || 0;
    this.celebrityCounts.set(name, current + 1);
  }

  getAverageLatency(minutes = 60, endpoint?: string): number {
    const data = this.filteredRequests(minutes, endpoint);
    if (data.length === 0) return 0;
    const total = data.reduce((sum, r) => sum + r.latency, 0);
    return Math.round(total / data.length);
  }

  /** Return Nth percentile latency (e.g. p95 = 95) within a window */
  getLatencyPercentile(percentile = 95, minutes = 60, endpoint?: string): number {
    const data = this.filteredRequests(minutes, endpoint).map((r) => r.latency).sort((a, b) => a - b);
    if (data.length === 0) return 0;
    const index = Math.floor(((percentile / 100) * data.length));
    return data[Math.min(index, data.length - 1)];
  }

  /** Build a breakdown of endpoints with avg latency and counts */
  getEndpointBreakdown(minutes = 60) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recent = this.requests.filter((r) => r.timestamp > cutoff);
    const map: Record<string, { count: number; avg: number; p95: number }> = {};
    for (const r of recent) {
      if (!map[r.endpoint]) {
        map[r.endpoint] = { count: 0, avg: 0, p95: 0 };
      }
      const obj = map[r.endpoint];
      obj.count += 1;
      obj.avg += r.latency;
    }
    // finalize avg and p95
    for (const ep in map) {
      const reqs = recent.filter((r) => r.endpoint === ep).map((r) => r.latency);
      map[ep].avg = Math.round(map[ep].avg / map[ep].count);
      reqs.sort((a, b) => a - b);
      const idx = Math.floor(0.95 * reqs.length);
      map[ep].p95 = reqs[idx];
    }
    return map;
  }

  getTopCelebrities(limit = 10): CelebrityCount[] {
    return Array.from(this.celebrityCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getTotalRequests(): number {
    return this.requests.length;
  }

  getRequestsInLastHour(): number {
    const cutoff = Date.now() - 60 * 60 * 1000;
    return this.requests.filter((r) => r.timestamp > cutoff).length;
  }

  // ----------------------------
  // Failure & Error tracking
  // ----------------------------

  addFailure(endpoint: string, message: string, status = 500) {
    this.errorLogs.push({ timestamp: Date.now(), endpoint, message, status });
    // keep last 200 errors
    if (this.errorLogs.length > 200) {
      this.errorLogs = this.errorLogs.slice(-200);
    }
  }

  getTotalFailures(minutes = 60): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.requests.filter((r) => r.timestamp > cutoff && r.status >= 400).length;
  }

  getFailureRate(minutes = 60): number {
    const total = this.getRequestsInWindow(minutes);
    if (total === 0) return 0;
    const failures = this.getTotalFailures(minutes);
    return +(failures / total * 100).toFixed(2);
  }

  getStatusBreakdown(minutes = 60): Record<string, number> {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recent = this.requests.filter((r) => r.timestamp > cutoff);
    const breakdown: Record<string, number> = {};
    for (const req of recent) {
      const bucket = `${Math.floor(req.status / 100)}xx`;
      breakdown[bucket] = (breakdown[bucket] || 0) + 1;
    }
    return breakdown;
  }

  getRecentErrors(limit = 20) {
    return this.errorLogs.slice(-limit).reverse();
  }

  private getRequestsInWindow(minutes: number) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.requests.filter((r) => r.timestamp > cutoff).length;
  }

  private filteredRequests(minutes: number, endpoint?: string) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.requests.filter((r) => r.timestamp > cutoff && (!endpoint || r.endpoint === endpoint));
  }
}

export const metrics = new SimpleMetrics();

export function registerMetrics(app: Hono) {
  // ------------------------------------------
  // Middleware to capture latency per request
  // ------------------------------------------
  app.use('*', async (c, next) => {
    const start = Date.now();
    await next();
    const latency = Date.now() - start;

    metrics.addRequest(latency, c.req.path, c.res.status);
  });

  // Capture uncaught route errors
  app.onError((err, c) => {
    metrics.addFailure(c.req.path, err instanceof Error ? err.message : String(err), 500);
    // Re-throw to let existing error handling propagate
    throw err;
  });

  // ------------------------------------------
  // JSON metrics endpoint
  // ------------------------------------------
  app.get('/api/metrics', (c) =>
    c.json({
      averageLatency: metrics.getAverageLatency(),
      totalRequests: metrics.getTotalRequests(),
      requestsLastHour: metrics.getRequestsInLastHour(),
      totalFailures: metrics.getTotalFailures(),
      failureRate: metrics.getFailureRate(),
      statusBreakdown: metrics.getStatusBreakdown(),
      topCelebrities: metrics.getTopCelebrities(),
      avgLatencyMatches: metrics.getAverageLatency(60, '/api/matches'),
      p95LatencyMatches: metrics.getLatencyPercentile(95, 60, '/api/matches'),
      endpointBreakdown: metrics.getEndpointBreakdown(),
      recentErrors: metrics.getRecentErrors(),
    })
  );

  // ------------------------------------------
  // Simple HTML dashboard
  // ------------------------------------------
  app.get('/dashboard', (c) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Celebrity API Dashboard</title>
          <style>
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  background: #f5f5f5; 
              }
              .container { max-width: 1200px; margin: 0 auto; }
              .card { 
                  background: white; 
                  border-radius: 8px; 
                  padding: 20px; 
                  margin-bottom: 20px; 
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
              }
              .metric { display: inline-block; margin-right: 40px; }
              .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
              .metric-label { color: #666; font-size: 0.9em; }
              .celebrity-list { list-style: none; padding: 0; }
              .celebrity-item { 
                  display: flex; 
                  justify-content: space-between; 
                  padding: 8px 0; 
                  border-bottom: 1px solid #eee; 
              }
              .celebrity-item:last-child { border-bottom: none; }
              .count-badge { 
                  background: #2563eb; 
                  color: white; 
                  padding: 2px 8px; 
                  border-radius: 12px; 
                  font-size: 0.8em; 
              }
              h1 { color: #333; margin-bottom: 30px; }
              h2 { color: #666; margin-bottom: 15px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>🎭 Celebrity API Dashboard</h1>
              
              <div class="card">
                  <h2>📊 Performance Metrics</h2>
                  <div class="metric">
                      <div class="metric-value" id="avgLatency">-</div>
                      <div class="metric-label">Avg Latency (ms)</div>
                  </div>
                  <div class="metric">
                      <div class="metric-value" id="totalRequests">-</div>
                      <div class="metric-label">Total Requests</div>
                  </div>
                  <div class="metric">
                      <div class="metric-value" id="hourlyRequests">-</div>
                      <div class="metric-label">Last Hour</div>
                  </div>
                  <div class="metric">
                      <div class="metric-value" id="matchesAvgLatency">-</div>
                      <div class="metric-label">Matches Avg (ms)</div>
                  </div>
                  <div class="metric">
                      <div class="metric-value" id="matchesP95Latency">-</div>
                      <div class="metric-label">Matches P95 (ms)</div>
                  </div>
              </div>

              <div class="card">
                  <h2>🌟 Most Popular Celebrities</h2>
                  <ul class="celebrity-list" id="celebrityList">
                      <li>Loading...</li>
                  </ul>
              </div>

              <div class="card">
                  <h2>💡 Provider Stats (Upstash Multiplexer)</h2>
                  <ul class="celebrity-list" id="providerStatsList">
                      <li>Loading...</li>
                  </ul>
              </div>

              <div class="card">
                  <h2>🚨 Recent Errors</h2>
                  <ul class="celebrity-list" id="errorList">
                      <li>Loading...</li>
                  </ul>
              </div>
          </div>

          <script>
              async function updateMetrics() {
                  try {
                      const [metricsResp, providerResp] = await Promise.all([
                        fetch('/api/metrics'),
                        fetch('/api/stats')
                      ]);

                      const data = await metricsResp.json();
                      const provider = await providerResp.json();
                      
                      document.getElementById('avgLatency').textContent = data.averageLatency;
                      document.getElementById('totalRequests').textContent = data.totalRequests;
                      document.getElementById('hourlyRequests').textContent = data.requestsLastHour;
                      
                      // Update latency metrics for matches endpoint
                      document.getElementById('matchesAvgLatency').textContent = data.avgLatencyMatches;
                      document.getElementById('matchesP95Latency').textContent = data.p95LatencyMatches;

                      // Popular celebrities
                      const celebList = document.getElementById('celebrityList');
                      celebList.innerHTML = data.topCelebrities.length > 0 
                          ? data.topCelebrities.map(c => 
                              \`<li class="celebrity-item">  
                                  <span>\${c.name}</span>
                                  <span class="count-badge">\${c.count}</span>
                              </li>\`
                            ).join('')
                          : '<li class="celebrity-item">No data yet</li>';

                      // Provider stats (Upstash Multiplexer)
                      const providerList = document.getElementById('providerStatsList');
                      providerList.innerHTML = Object.keys(provider).length > 0 ?
                        Object.entries(provider).map(([model, stats]) => {
                          return \`<li class="celebrity-item">  
                              <span>\${model}</span>
                              <span class="count-badge">S: \${stats.success} | RL: \${stats.rateLimited} | F: \${stats.failed}</span>
                          </li>\`;
                        }).join('')
                        : '<li class="celebrity-item">No provider data</li>';

                      // Recent errors
                      const errorList = document.getElementById('errorList');
                      errorList.innerHTML = data.recentErrors.length > 0 ?
                        data.recentErrors.map(e => {
                          const date = new Date(e.timestamp).toLocaleTimeString();
                          return \`<li class="celebrity-item">  
                              <span>[\${date}] \${e.endpoint}</span>
                              <span class="count-badge">\${e.status || ''}</span>
                              <span style="flex:1;text-align:right;color:#b91c1c;">\${e.message}</span>
                          </li>\`;
                        }).join('')
                        : '<li class="celebrity-item">No recent errors</li>';

                  } catch (err) {
                      console.error('Failed to fetch metrics:', err);
                  }
              }

              // Update every 5 seconds
              setInterval(updateMetrics, 5000);
              updateMetrics(); // Initial load
          </script>
      </body>
      </html>
    `;

    return c.html(html);
  });
} 