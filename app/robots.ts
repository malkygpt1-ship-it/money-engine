import type { MetadataRoute } from "next";

export default function robots():MetadataRoute.Robots{
 const base=process.env.NEXT_PUBLIC_APP_URL||"https://money-engine-omega.vercel.app";
 return {rules:[{userAgent:"*",allow:["/offers/"],disallow:["/api/","/delivery","/skills","/agents","/factory"]}],sitemap:`${base}/sitemap.xml`};
}
