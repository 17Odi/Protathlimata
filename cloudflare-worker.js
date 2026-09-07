// Cloudflare Worker: proxy προς το football-data.org που κρατάει το API key σου
// μυστικό (ποτέ δεν φτάνει στο browser) και προσθέτει τα CORS headers που λείπουν
// από το δωρεάν πλάνο του football-data.org, ώστε το index.html να μπορεί να
// καλέσει τα στατιστικά απευθείας.
//
// Ανάπτυξη μέσω Git-connected Workers Builds (dashboard.cloudflare.com):
//   1. Settings -> Builds -> Deploy command, βάλε (πρώτα deploy, μετά secret -
//      το wrangler δεν επιτρέπει secret put πριν να έχει γίνει deploy η έκδοση):
//        sh -c 'npx wrangler deploy && printf "%s" "$FOOTBALL_API_KEY" | npx wrangler secret put FOOTBALL_API_KEY'
//   2. Settings -> Variables and Secrets -> Add build variable FOOTBALL_API_KEY
//      (encrypted) με το key σου από football-data.org.
//   3. Αντέγραψε το URL του worker (κάτι σαν https://<name>.<subdomain>.workers.dev)
//      και βάλτο στο πεδίο "URL του Worker σου" μέσα στο app, tab "API".

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    const url = new URL(request.url);
    const target = "https://api.football-data.org/v4" + url.pathname + url.search;
    const upstream = await fetch(target, {
      headers: { "X-Auth-Token": env.FOOTBALL_API_KEY }
    });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json", ...corsHeaders() }
    });
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
