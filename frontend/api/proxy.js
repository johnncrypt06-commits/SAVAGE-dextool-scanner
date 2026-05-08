const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'proxy-authorization',
  'proxy-connection',
  'content-length',
  'x-savage-frontend-origin',
]);

function frontendOrigin(req) {
  var proto = req.headers['x-forwarded-proto'] || 'https';
  var host = req.headers.host;
  if (Array.isArray(proto)) proto = proto[0];
  if (Array.isArray(host)) host = host[0];
  proto = String(proto).split(',')[0].trim();
  host = String(host || '').split(',')[0].trim();
  return host ? proto + '://' + host : '';
}

function resolveIncomingPath(req) {
  var candidates = [
    req.url,
    req.headers['x-vercel-original-url'],
    req.headers['x-forwarded-uri'],
    req.headers['x-original-url'],
  ];
  for (var i = 0; i < candidates.length; i++) {
    var raw = candidates[i];
    if (!raw) continue;
    if (Array.isArray(raw)) raw = raw[0];
    raw = String(raw);
    if (raw.indexOf('/api/') === 0) return raw;
  }
  // Defensive fallback: strip leading '/api/proxy' that Vercel may surface on rewrite
  var fallback = String(req.url || '');
  if (fallback.indexOf('/api/proxy') === 0) {
    return '/api' + fallback.slice('/api/proxy'.length);
  }
  return fallback;
}

module.exports = async function handler(req, res) {
  var backendUrl =
    process.env.BACKEND_URL ||
    process.env.FRONTEND_API_URL ||
    process.env.VITE_API_URL;

  if (!backendUrl) {
    return res.status(500).json({
      error:
        'No backend URL configured. Set BACKEND_URL in Vercel project settings to your Railway backend URL (e.g. https://savage-backend.up.railway.app).',
    });
  }

  var base = backendUrl.replace(/\/+$/, '');
  var incomingPath = resolveIncomingPath(req);
  var target = base + incomingPath;

  var headers = {};
  for (var key in req.headers) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers[key] = req.headers[key];
    }
  }

  var origin = frontendOrigin(req);
  if (origin) {
    headers['x-savage-frontend-origin'] = origin;
  }

  var body;
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body != null) {
    if (Buffer.isBuffer(req.body)) {
      body = req.body;
    } else if (typeof req.body === 'string') {
      body = req.body;
    } else {
      body = JSON.stringify(req.body);
    }
  }

  try {
    var upstream = await fetch(target, {
      method: req.method,
      headers: headers,
      body: body,
      redirect: 'manual',
    });

    res.status(upstream.status);

    var setCookies =
      typeof upstream.headers.getSetCookie === 'function'
        ? upstream.headers.getSetCookie()
        : [];

    upstream.headers.forEach(function (value, key) {
      var lower = key.toLowerCase();
      if (lower === 'transfer-encoding') return;
      if (lower === 'set-cookie') return;
      res.setHeader(key, value);
    });

    if (setCookies.length > 0) {
      res.setHeader('set-cookie', setCookies);
    }

    var buf = Buffer.from(await upstream.arrayBuffer());
    return res.send(buf);
  } catch (err) {
    return res.status(502).json({
      error: 'Bad Gateway',
      message: err && err.message ? String(err.message) : String(err),
      target: target.replace(/(api[-_]?key=)[^&]+/gi, '$1***'),
    });
  }
};
