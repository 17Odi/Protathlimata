// Cloudflare Worker: proxy προς το football-data.org που κρατάει το API key σου
// μυστικό (ποτέ δεν φτάνει στο browser) και προσθέτει τα CORS headers που λείπουν
// από το δωρεάν πλάνο του football-data.org, ώστε το index.html να μπορεί να
// καλέσει τα στατιστικά απευθείας.
//
// Οδηγίες ανάπτυξης (dashboard.cloudflare.com, δωρεάν, χωρίς κάρτα):
//   1. Workers & Pages -> Create -> Create Worker -> δώσε ένα όνομα -> Deploy.
//   2. Edit code -> σβήσε το προεπιλεγμένο περιεχόμενο -> επικόλλησε αυτό το αρχείο -> Deploy.
//   3. Settings -> Variables and Secrets -> Add -> name: FOOTBALL_API_KEY,
//      value: το key σου από football-data.org -> encrypt -> Save & deploy.
//   4. Αντέγραψε το URL του worker (κάτι σαν https://<name>.<subdomain>.workers.dev)
//      και βάλτο στο πεδίο "URL του Worker σου" μέσα στο app, tab "API".

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    const url = new URL(request.url);
    if (url.pathname === "/debug-key") {
      return new Response(JSON.stringify({
        keySet: Boolean(env.FOOTBALL_API_KEY),
        keyLength: (env.FOOTBALL_API_KEY || "").length
      }), { headers: { "Content-Type": "application/json", ...corsHeaders() } });
    }
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
